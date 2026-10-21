import { Router } from 'express'
import { db } from '../db.js'

export const memberExpensesRouter = Router()

// GET /api/members — List all members and their balances
memberExpensesRouter.get('/members', (req, res) => {
  try {
    const members = db.prepare('SELECT * FROM members ORDER BY name ASC').all()
    res.json(members)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/member-expenses — List all member-funded outlays
memberExpensesRouter.get('/member-expenses', (req, res) => {
  try {
    const expenses = db.prepare(`
      SELECT 
        e.*,
        m.name as member_full_name,
        m.role as member_role
      FROM member_expenses e
      LEFT JOIN members m ON e.member_id = m.id
      ORDER BY e.date DESC
    `).all()

    const reimbursements = db.prepare('SELECT * FROM member_reimbursements ORDER BY reimbursement_date DESC').all()

    res.json({ expenses, reimbursements })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/member-expenses — Submit new member outlay
memberExpensesRouter.post('/member-expenses', (req, res) => {
  try {
    const {
      memberId,
      date,
      amountETB,
      category,
      businessActivity = 'Transport',
      description,
      businessPurpose,
      supplierOrPayee,
      relatedEntityId,
      relatedEntityType,
      receiptFileName,
      notes,
    } = req.body

    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(memberId)
    if (!member) {
      return res.status(404).json({ error: 'Company member not found' })
    }

    const expenseId = `MEXP-${Date.now()}`
    const expenseNumber = `EXP-MEM-${Math.floor(1000 + Math.random() * 9000)}`
    const amount = Number(amountETB)

    // Accounting invariant: Approved expense credits member liability; does NOT touch bank balance
    db.prepare(`
      INSERT INTO member_expenses (
        id, expense_number, member_id, member_name, date, amount_etb, currency,
        category, business_activity, description, business_purpose, supplier_or_payee,
        related_entity_id, related_entity_type, approval_status, reimbursement_status,
        amount_reimbursed_etb, remaining_owed_etb, receipt_file_name, notes
      ) VALUES (?, ?, ?, ?, ?, ?, 'ETB', ?, ?, ?, ?, ?, ?, ?, 'Approved', 'Unreimbursed', 0, ?, ?, ?)
    `).run(
      expenseId, expenseNumber, member.id, member.name, date, amount,
      category, businessActivity, description, businessPurpose, supplierOrPayee,
      relatedEntityId, relatedEntityType, amount, receiptFileName, notes
    )

    // Update member's funded and outstanding balance
    db.prepare(`
      UPDATE members
      SET total_funded_etb = total_funded_etb + ?,
          outstanding_balance_etb = outstanding_balance_etb + ?
      WHERE id = ?
    `).run(amount, amount, member.id)

    // Record in Accounts Payable as Due to Member
    db.prepare(`
      INSERT INTO payables (
        id, bill_no, vendor_or_payee, category, issue_date, due_date,
        total_amount_etb, amount_paid_etb, balance_due_etb, status,
        business_activity, is_member_liability, member_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, 'Approved for Payment', ?, 1, ?)
    `).run(
      `AP-${expenseId}`, expenseNumber, `${member.name} (Member Outlay)`,
      category, date, date, amount, amount, businessActivity, member.id
    )

    const created = db.prepare('SELECT * FROM member_expenses WHERE id = ?').get(expenseId)
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/member-expenses/:id/reimburse — Disburse reimbursement from bank account
memberExpensesRouter.post('/member-expenses/:id/reimburse', (req, res) => {
  try {
    const { id } = req.params
    const { amountETB, bankAccountId, bankReference, paymentMethod = 'Bank Transfer', disbursedBy = 'Treasury' } = req.body

    const expense = db.prepare('SELECT * FROM member_expenses WHERE id = ?').get(id)
    if (!expense) {
      return res.status(404).json({ error: 'Expense outlay record not found' })
    }

    const bankAccount = db.prepare('SELECT * FROM bank_accounts WHERE id = ?').get(bankAccountId)
    if (!bankAccount) {
      return res.status(404).json({ error: 'Disbursement bank account not found' })
    }

    const reimbAmount = Number(amountETB)
    if (reimbAmount <= 0 || reimbAmount > expense.remaining_owed_etb) {
      return res.status(400).json({ error: 'Invalid reimbursement amount' })
    }

    if (bankAccount.balance_etb < reimbAmount) {
      return res.status(400).json({ error: `Insufficient bank funds in ${bankAccount.bank_name}` })
    }

    const reimbId = `REIMB-${Date.now()}`
    const today = new Date().toISOString().split('T')[0]

    // 1. Record reimbursement disbursement
    db.prepare(`
      INSERT INTO member_reimbursements (
        id, expense_id, member_id, reimbursement_date, amount_etb,
        bank_account_id, bank_account_name, bank_reference, payment_method, disbursed_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      reimbId, expense.id, expense.member_id, today, reimbAmount,
      bankAccount.id, bankAccount.bank_name, bankReference, paymentMethod, disbursedBy
    )

    // 2. Deduct from Company Bank Account (Cash outflow)
    db.prepare(`
      UPDATE bank_accounts
      SET balance_etb = balance_etb - ?
      WHERE id = ?
    `).run(reimbAmount, bankAccount.id)

    // 3. Update Member Expense Status
    const newReimbursed = expense.amount_reimbursed_etb + reimbAmount
    const newRemaining = Math.max(0, expense.remaining_owed_etb - reimbAmount)
    const newStatus = newRemaining <= 0.01 ? 'Fully Reimbursed' : 'Partially Reimbursed'

    db.prepare(`
      UPDATE member_expenses
      SET amount_reimbursed_etb = ?,
          remaining_owed_etb = ?,
          reimbursement_status = ?
      WHERE id = ?
    `).run(newReimbursed, newRemaining, newStatus, expense.id)

    // 4. Update Member's Running Balances
    db.prepare(`
      UPDATE members
      SET total_reimbursed_etb = total_reimbursed_etb + ?,
          outstanding_balance_etb = outstanding_balance_etb - ?
      WHERE id = ?
    `).run(reimbAmount, reimbAmount, expense.member_id)

    // 5. Update AP balance
    db.prepare(`
      UPDATE payables
      SET amount_paid_etb = amount_paid_etb + ?,
          balance_due_etb = balance_due_etb - ?,
          status = CASE WHEN balance_due_etb - ? <= 0.01 THEN 'Paid' ELSE 'Approved for Payment' END
      WHERE id = ?
    `).run(reimbAmount, reimbAmount, reimbAmount, `AP-${expense.id}`)

    // 6. Record Bank Ledger Transaction
    // CRITICAL: Type is 'Member Reimbursement' — it settles a liability and DOES NOT re-enter P&L
    db.prepare(`
      INSERT INTO financial_transactions (
        id, reference_number, date, type, category, from_account,
        amount_etb, business_activity, is_reimbursement,
        reimbursed_member_expense_id, status, notes
      ) VALUES (?, ?, ?, 'Member Reimbursement', 'Member Reimbursement', ?, ?, 'Shared', 1, ?, 'Cleared', ?)
    `).run(
      `TXN-${reimbId}`, bankReference, today, bankAccount.bank_name,
      reimbAmount, expense.id, `Reimbursement to ${expense.member_name} for ${expense.category}`
    )

    const updatedExpense = db.prepare('SELECT * FROM member_expenses WHERE id = ?').get(expense.id)
    const updatedAccount = db.prepare('SELECT * FROM bank_accounts WHERE id = ?').get(bankAccount.id)

    res.json({
      success: true,
      expense: updatedExpense,
      bankAccount: updatedAccount,
      message: `Reimbursed ETB ${reimbAmount.toLocaleString()} to ${expense.member_name} from ${bankAccount.bank_name}`,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
