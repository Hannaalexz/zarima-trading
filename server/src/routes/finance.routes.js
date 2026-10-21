import { Router } from 'express'
import { db } from '../db.js'

export const financeRouter = Router()

// -------------------------------------------------------------
// 10 BANK ACCOUNTS
// -------------------------------------------------------------
financeRouter.get('/bank-accounts', (req, res) => {
  try {
    const accounts = db.prepare('SELECT * FROM bank_accounts ORDER BY balance_etb DESC').all()
    const mapped = accounts.map((a) => ({
      id: a.id,
      bankName: a.bank_name,
      accountNumber: a.account_number,
      branchName: a.branch_name,
      accountType: a.account_type,
      balanceETB: a.balance_etb,
      lastReconciledDate: a.last_reconciled_date,
      status: a.status,
    }))
    res.json(mapped)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// -------------------------------------------------------------
// FINANCIAL TRANSACTIONS JOURNAL
// -------------------------------------------------------------
financeRouter.get('/transactions', (req, res) => {
  try {
    const txs = db.prepare('SELECT * FROM financial_transactions ORDER BY date DESC').all()
    const mapped = txs.map((t) => ({
      id: t.id,
      referenceNumber: t.reference_number,
      date: t.date,
      type: t.type,
      category: t.category,
      fromAccount: t.from_account,
      toAccount: t.to_account,
      amountETB: t.amount_etb,
      businessActivity: t.business_activity,
      isMemberFunded: Boolean(t.is_member_funded),
      paidByMember: t.paid_by_member,
      memberId: t.member_id,
      memberName: t.member_name,
      isReimbursement: Boolean(t.is_reimbursement),
      reimbursedMemberExpenseId: t.reimbursed_member_expense_id,
      status: t.status,
      notes: t.notes,
    }))
    res.json(mapped)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

financeRouter.post('/transactions', (req, res) => {
  try {
    const { referenceNumber, date, type, category, amountETB, fromAccount, toAccount, businessActivity = 'Shared', isMemberFunded, paidByMember, status = 'Cleared', notes } = req.body
    const id = `TXN-${Date.now()}`

    db.prepare(`
      INSERT INTO financial_transactions (
        id, reference_number, date, type, category, from_account, to_account,
        amount_etb, business_activity, is_member_funded, paid_by_member, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, referenceNumber, date, type, category, fromAccount || null, toAccount || null,
      Number(amountETB), businessActivity, isMemberFunded ? 1 : 0, paidByMember || null, status, notes || null
    )

    const created = db.prepare('SELECT * FROM financial_transactions WHERE id = ?').get(id)
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// -------------------------------------------------------------
// AUTOMATED BANK RECONCILIATION
// -------------------------------------------------------------
financeRouter.get('/reconciliation/statements', (req, res) => {
  try {
    const statements = db.prepare('SELECT * FROM bank_statements ORDER BY imported_at DESC').all()

    const fullStatements = statements.map((s) => {
      const transactions = db.prepare('SELECT * FROM bank_statement_transactions WHERE statement_id = ?').all(s.id)
      return {
        id: s.id,
        bankAccountId: s.account_id,
        accountId: s.account_id,
        bankName: s.account_name,
        accountName: s.account_name,
        statementNumber: s.statement_number,
        periodStart: s.period_start,
        statementPeriodStart: s.period_start,
        periodEnd: s.period_end,
        statementPeriodEnd: s.period_end,
        openingBalanceETB: s.opening_balance_etb,
        closingBalanceETB: s.closing_balance_etb,
        importedAt: s.imported_at,
        fileName: `${s.statement_number}.xlsx`,
        fileFormat: 'xlsx',
        totalTransactions: s.total_transactions,
        transactionCount: s.total_transactions,
        matchedCount: s.matched_count,
        needsReviewCount: s.needs_review_count,
        unmatchedCount: s.unmatched_count,
        status: s.status,
        isLocked: Boolean(s.locked),
        locked: Boolean(s.locked),
        lockedAt: s.locked_at,
        transactions: transactions.map((t) => ({
          id: t.id,
          statementId: s.id,
          transactionDate: t.date,
          date: t.date,
          reference: t.reference_number || 'N/A',
          referenceNumber: t.reference_number || 'N/A',
          description: t.description || 'Transaction line',
          amountETB: t.amount_etb,
          isCredit: Boolean(t.is_credit),
          debitETB: !t.is_credit ? t.amount_etb : 0,
          creditETB: t.is_credit ? t.amount_etb : 0,
          matchedTransactionId: t.matched_transaction_id,
          matchConfidence: t.match_confidence,
          matchReason: t.match_reason,
          status: t.status,
          isReconciled: Boolean(t.is_reconciled),
        })),
      }
    })

    res.json(fullStatements)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/reconciliation/statements — Upload & run matching engine
financeRouter.post('/reconciliation/statements', (req, res) => {
  try {
    const { accountId, statementNumber, periodStart, periodEnd, openingBalanceETB, closingBalanceETB, rawTransactions = [] } = req.body

    // 1. Duplicate check
    const existing = db.prepare('SELECT id FROM bank_statements WHERE statement_number = ? AND account_id = ?').get(statementNumber, accountId)
    if (existing) {
      return res.status(409).json({ error: `Statement ${statementNumber} has already been imported for this account.` })
    }

    const account = db.prepare('SELECT * FROM bank_accounts WHERE id = ?').get(accountId)
    if (!account) {
      return res.status(404).json({ error: 'Bank account not found' })
    }

    const statementId = `STMT-${Date.now()}`
    const internalTxs = db.prepare('SELECT * FROM financial_transactions').all()

    // 2. Rule-based auto-matching engine with strict 90% threshold and ±3-day tolerance
    const processedTxs = rawTransactions.map((stx, idx) => {
      const stxId = `STX-${Date.now()}-${idx}`
      const stxAmount = Number(stx.amountETB)
      const isCredit = Boolean(stx.isCredit)

      // Search for candidate matches in internal ledger
      const candidates = internalTxs.filter((itx) => {
        const matchesAmount = Math.abs(itx.amount_etb - stxAmount) < 0.01
        const matchesDirection = isCredit
          ? (itx.type === 'Income' || itx.type === 'Capital Contribution')
          : (itx.type === 'Expense' || itx.type === 'Member Reimbursement' || itx.type === 'Transfer')
        return matchesAmount && matchesDirection
      })

      if (candidates.length === 1) {
        const match = candidates[0]
        const dateDiff = Math.abs((new Date(stx.date) - new Date(match.date)) / (1000 * 3600 * 24))
        const refMatch = match.reference_number && stx.referenceNumber && (
          stx.referenceNumber.toLowerCase().includes(match.reference_number.toLowerCase()) ||
          match.reference_number.toLowerCase().includes(stx.referenceNumber.toLowerCase())
        )

        let confidence = 0
        let status = 'Needs Review'
        let reason = ''

        if (refMatch) {
          confidence = 98
          status = 'Matched'
          reason = `Auto-matched (98% confidence): Exact amount ETB ${stxAmount.toLocaleString()} with reference keyword match (${match.reference_number}).`
        } else if (dateDiff <= 3) {
          confidence = 92
          status = 'Matched'
          reason = `Auto-matched (92% confidence): Exact amount ETB ${stxAmount.toLocaleString()} within ±3-day tolerance (${dateDiff.toFixed(0)} days diff, ${match.type}).`
        } else {
          // Beyond ±3-day tolerance and no reference match -> CANNOT be silently accepted!
          confidence = 70
          status = 'Needs Review'
          reason = `Ambiguous date window: Exact amount matches ${match.reference_number}, but transaction date is ${dateDiff.toFixed(0)} days apart (> ±3 days). Requires manual review.`
        }

        return {
          id: stxId,
          date: stx.date,
          referenceNumber: stx.referenceNumber,
          description: stx.description,
          amountETB: stxAmount,
          isCredit,
          matchedTransactionId: status === 'Matched' ? match.id : null,
          matchConfidence: confidence,
          matchReason: reason,
          status,
          isReconciled: status === 'Matched',
        }
      } else if (candidates.length > 1) {
        return {
          id: stxId,
          date: stx.date,
          referenceNumber: stx.referenceNumber,
          description: stx.description,
          amountETB: stxAmount,
          isCredit,
          matchedTransactionId: null,
          matchConfidence: 65,
          matchReason: `Ambiguous match: Found ${candidates.length} internal ledger entries matching ETB ${stxAmount.toLocaleString()}. Manual confirmation required.`,
          status: 'Needs Review',
          isReconciled: false,
        }
      } else {
        return {
          id: stxId,
          date: stx.date,
          referenceNumber: stx.referenceNumber,
          description: stx.description,
          amountETB: stxAmount,
          isCredit,
          matchedTransactionId: null,
          matchConfidence: 0,
          matchReason: 'Unmatched Bank Transaction: No corresponding internal ledger transaction found.',
          status: 'Unmatched Bank Transaction',
          isReconciled: false,
        }
      }
    })

    const matchedCount = processedTxs.filter((t) => t.status === 'Matched').length
    const needsReviewCount = processedTxs.filter((t) => t.status === 'Needs Review').length
    const unmatchedCount = processedTxs.filter((t) => t.status === 'Unmatched Bank Transaction').length

    // Execute atomic insert inside database transaction
    db.exec('BEGIN TRANSACTION;')
    try {
      db.prepare(`
        INSERT INTO bank_statements (
          id, account_id, account_name, statement_number, period_start, period_end,
          opening_balance_etb, closing_balance_etb, total_transactions,
          matched_count, needs_review_count, unmatched_count, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        statementId, account.id, account.bank_name, statementNumber, periodStart, periodEnd,
        Number(openingBalanceETB), Number(closingBalanceETB), processedTxs.length,
        matchedCount, needsReviewCount, unmatchedCount,
        needsReviewCount > 0 ? 'Needs Review' : 'Fully Reconciled'
      )

      const insertStx = db.prepare(`
        INSERT INTO bank_statement_transactions (
          id, statement_id, date, reference_number, description, amount_etb,
          is_credit, matched_transaction_id, match_confidence, match_reason, status, is_reconciled
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      for (const t of processedTxs) {
        insertStx.run(
          t.id, statementId, t.date, t.referenceNumber, t.description, t.amountETB,
          t.isCredit ? 1 : 0, t.matchedTransactionId, t.matchConfidence, t.matchReason, t.status, t.isReconciled ? 1 : 0
        )
      }

      db.exec('COMMIT;')
    } catch (dbErr) {
      db.exec('ROLLBACK;')
      throw dbErr
    }

    res.status(201).json({
      id: statementId,
      message: `Statement ${statementNumber} imported successfully with ${matchedCount} matched and ${needsReviewCount} flagged for review.`,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/reconciliation/match-existing — Link statement line to existing internal record (NO duplicate accounting entry)
financeRouter.post('/reconciliation/match-existing', (req, res) => {
  try {
    const { statementId, statementTxId, internalTxId } = req.body

    const stx = db.prepare('SELECT * FROM bank_statement_transactions WHERE id = ? AND statement_id = ?').get(statementTxId, statementId)
    if (!stx) {
      return res.status(404).json({ error: 'Statement transaction not found' })
    }

    const internalTx = db.prepare('SELECT * FROM financial_transactions WHERE id = ?').get(internalTxId)
    if (!internalTx) {
      return res.status(404).json({ error: 'Internal transaction not found' })
    }

    db.exec('BEGIN TRANSACTION;')
    try {
      // 1. Mark statement transaction as Matched
      db.prepare(`
        UPDATE bank_statement_transactions
        SET status = 'Matched',
            is_reconciled = 1,
            matched_transaction_id = ?,
            match_confidence = 100,
            match_reason = ?
        WHERE id = ?
      `).run(
        internalTx.id,
        `Manually matched by authorized accountant to internal transaction #${internalTx.reference_number}.`,
        statementTxId
      )

      // 2. Mark internal transaction as Reconciled
      db.prepare("UPDATE financial_transactions SET status = 'Reconciled' WHERE id = ?").run(internalTx.id)

      // 3. Recalculate statement metrics
      const allTx = db.prepare('SELECT status FROM bank_statement_transactions WHERE statement_id = ?').all(statementId)
      const matched = allTx.filter((t) => t.status === 'Matched').length
      const review = allTx.filter((t) => t.status === 'Needs Review').length
      const unmatched = allTx.filter((t) => t.status === 'Unmatched Bank Transaction').length

      db.prepare(`
        UPDATE bank_statements
        SET matched_count = ?,
            needs_review_count = ?,
            unmatched_count = ?,
            status = CASE WHEN ? = 0 AND ? = 0 THEN 'Fully Reconciled' ELSE 'Needs Review' END
        WHERE id = ?
      `).run(matched, review, unmatched, review, unmatched, statementId)

      db.exec('COMMIT;')
    } catch (e) {
      db.exec('ROLLBACK;')
      throw e
    }

    res.json({ success: true, message: `Statement line matched to internal transaction ${internalTx.reference_number}.` })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/reconciliation/post-unmatched — Classify and post missing bank line (e.g. Bank Fee)
financeRouter.post('/reconciliation/post-unmatched', (req, res) => {
  try {
    const { statementId, statementTxId, category, businessActivity = 'Shared', notes } = req.body

    const stx = db.prepare('SELECT * FROM bank_statement_transactions WHERE id = ? AND statement_id = ?').get(statementTxId, statementId)
    if (!stx) {
      return res.status(404).json({ error: 'Statement transaction not found' })
    }

    const statement = db.prepare('SELECT * FROM bank_statements WHERE id = ?').get(statementId)
    if (!statement) {
      return res.status(404).json({ error: 'Parent bank statement not found' })
    }

    if (statement.locked) {
      return res.status(403).json({ error: 'Cannot modify a locked bank reconciliation period.' })
    }

    const newTxId = `TXN-REC-${Date.now()}`
    const isCredit = Boolean(stx.is_credit)
    const txType = isCredit ? 'Income' : 'Expense'

    db.exec('BEGIN TRANSACTION;')
    try {
      // 1. Post new verified transaction into ledger
      db.prepare(`
        INSERT INTO financial_transactions (
          id, reference_number, date, type, category, from_account,
          amount_etb, business_activity, status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Reconciled', ?)
      `).run(
        newTxId, stx.reference_number || `ADJ-${Date.now()}`, stx.date,
        txType, category || 'Bank Service Charges & Fees', statement.account_name,
        stx.amount_etb, businessActivity,
        notes || `Reconciliation adjustment for statement line: ${stx.description}`
      )

      // 2. Mark statement transaction as Matched
      db.prepare(`
        UPDATE bank_statement_transactions
        SET status = 'Matched',
            is_reconciled = 1,
            matched_transaction_id = ?,
            match_confidence = 100,
            match_reason = ?
        WHERE id = ?
      `).run(
        newTxId,
        `Classified and posted to ledger under category "${category}" (${businessActivity}).`,
        statementTxId
      )

      // 3. Recalculate statement metrics
      const allTx = db.prepare('SELECT status FROM bank_statement_transactions WHERE statement_id = ?').all(statementId)
      const matched = allTx.filter((t) => t.status === 'Matched').length
      const review = allTx.filter((t) => t.status === 'Needs Review').length
      const unmatched = allTx.filter((t) => t.status === 'Unmatched Bank Transaction').length

      db.prepare(`
        UPDATE bank_statements
        SET matched_count = ?,
            needs_review_count = ?,
            unmatched_count = ?,
            status = CASE WHEN ? = 0 AND ? = 0 THEN 'Fully Reconciled' ELSE 'Needs Review' END
        WHERE id = ?
      `).run(matched, review, unmatched, review, unmatched, statementId)

      db.exec('COMMIT;')
    } catch (e) {
      db.exec('ROLLBACK;')
      throw e
    }

    res.json({ success: true, message: `Transaction classified as "${category}" and posted to ledger.` })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/reconciliation/statements/:id/lock — Lock reconciliation
financeRouter.post('/reconciliation/statements/:id/lock', (req, res) => {
  try {
    const statement = db.prepare('SELECT * FROM bank_statements WHERE id = ?').get(req.params.id)
    if (!statement) {
      return res.status(404).json({ error: 'Bank statement not found' })
    }

    if (statement.locked) {
      return res.status(400).json({ error: 'This statement is already locked.' })
    }

    const today = new Date().toISOString()
    db.prepare('UPDATE bank_statements SET locked = 1, locked_at = ?, status = ? WHERE id = ?').run(today, 'Reconciliation Locked', req.params.id)
    res.json({ success: true, message: 'Reconciliation period locked and audited permanently.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// -------------------------------------------------------------
// PAYROLL, RECEIVABLES & PAYABLES
// -------------------------------------------------------------
financeRouter.get('/payroll', (req, res) => {
  try {
    const entries = db.prepare('SELECT * FROM payroll_entries ORDER BY payroll_month DESC').all()
    res.json(entries)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

financeRouter.get('/receivables', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM receivables ORDER BY due_date ASC').all()
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

financeRouter.get('/payables', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM payables ORDER BY due_date ASC').all()
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
