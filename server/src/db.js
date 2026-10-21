import { DatabaseSync } from 'node:sqlite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, '..', 'data')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, 'zarima.db')
export const db = new DatabaseSync(dbPath)

// Initialize schema tables
export function initDatabase() {
  db.exec(`
    PRAGMA foreign_keys = ON;

    -- Company Members & Member-Funded Outlays
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      total_funded_etb REAL DEFAULT 0,
      total_reimbursed_etb REAL DEFAULT 0,
      outstanding_balance_etb REAL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS member_expenses (
      id TEXT PRIMARY KEY,
      expense_number TEXT UNIQUE NOT NULL,
      member_id TEXT NOT NULL,
      member_name TEXT NOT NULL,
      date TEXT NOT NULL,
      amount_etb REAL NOT NULL,
      currency TEXT DEFAULT 'ETB',
      category TEXT NOT NULL,
      business_activity TEXT NOT NULL, -- 'Cement' | 'Transport' | 'Shared'
      description TEXT NOT NULL,
      business_purpose TEXT NOT NULL,
      supplier_or_payee TEXT,
      related_entity_id TEXT,
      related_entity_type TEXT,
      approval_status TEXT DEFAULT 'Approved', -- 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected'
      reimbursement_status TEXT DEFAULT 'Unreimbursed', -- 'Unreimbursed' | 'Partially Reimbursed' | 'Fully Reimbursed'
      amount_reimbursed_etb REAL DEFAULT 0,
      remaining_owed_etb REAL NOT NULL,
      receipt_file_name TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (member_id) REFERENCES members(id)
    );

    CREATE TABLE IF NOT EXISTS member_reimbursements (
      id TEXT PRIMARY KEY,
      expense_id TEXT NOT NULL,
      member_id TEXT NOT NULL,
      reimbursement_date TEXT NOT NULL,
      amount_etb REAL NOT NULL,
      bank_account_id TEXT NOT NULL,
      bank_account_name TEXT NOT NULL,
      bank_reference TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      disbursed_by TEXT NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (expense_id) REFERENCES member_expenses(id),
      FOREIGN KEY (member_id) REFERENCES members(id)
    );

    -- 10 Bank Accounts Treasury Portfolios
    CREATE TABLE IF NOT EXISTS bank_accounts (
      id TEXT PRIMARY KEY,
      bank_name TEXT NOT NULL,
      account_number TEXT NOT NULL,
      branch_name TEXT NOT NULL,
      account_type TEXT NOT NULL,
      balance_etb REAL NOT NULL,
      last_reconciled_date TEXT NOT NULL,
      status TEXT DEFAULT 'Active',
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- General Ledger Financial Transactions
    CREATE TABLE IF NOT EXISTS financial_transactions (
      id TEXT PRIMARY KEY,
      reference_number TEXT UNIQUE NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL, -- 'Income' | 'Expense' | 'Transfer' | 'Member Reimbursement' | 'Capital Contribution' | 'Partner Funded'
      category TEXT NOT NULL,
      from_account TEXT,
      to_account TEXT,
      amount_etb REAL NOT NULL,
      business_activity TEXT DEFAULT 'Shared', -- 'Cement' | 'Transport' | 'Shared'
      cement_percentage REAL,
      transport_percentage REAL,
      allocated_cement_etb REAL,
      allocated_transport_etb REAL,
      is_member_funded INTEGER DEFAULT 0,
      paid_by_member TEXT,
      member_id TEXT,
      member_name TEXT,
      is_reimbursement INTEGER DEFAULT 0,
      reimbursed_member_expense_id TEXT,
      status TEXT DEFAULT 'Cleared', -- 'Cleared' | 'Pending Reconciliation' | 'Reconciled'
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Automated Bank Reconciliation Statements
    CREATE TABLE IF NOT EXISTS bank_statements (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      account_name TEXT NOT NULL,
      statement_number TEXT UNIQUE NOT NULL,
      period_start TEXT NOT NULL,
      period_end TEXT NOT NULL,
      opening_balance_etb REAL NOT NULL,
      closing_balance_etb REAL NOT NULL,
      imported_at TEXT DEFAULT CURRENT_TIMESTAMP,
      total_transactions INTEGER NOT NULL,
      matched_count INTEGER DEFAULT 0,
      needs_review_count INTEGER DEFAULT 0,
      unmatched_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Pending Review',
      locked INTEGER DEFAULT 0,
      locked_at TEXT,
      FOREIGN KEY (account_id) REFERENCES bank_accounts(id)
    );

    CREATE TABLE IF NOT EXISTS bank_statement_transactions (
      id TEXT PRIMARY KEY,
      statement_id TEXT NOT NULL,
      date TEXT NOT NULL,
      reference_number TEXT NOT NULL,
      description TEXT NOT NULL,
      amount_etb REAL NOT NULL,
      is_credit INTEGER NOT NULL,
      matched_transaction_id TEXT,
      match_confidence REAL DEFAULT 0,
      match_reason TEXT,
      status TEXT DEFAULT 'Needs Review',
      is_reconciled INTEGER DEFAULT 0,
      FOREIGN KEY (statement_id) REFERENCES bank_statements(id) ON DELETE CASCADE
    );

    -- Fleet & Heavy Haulage Transport
    CREATE TABLE IF NOT EXISTS trucks (
      id TEXT PRIMARY KEY,
      plate_number TEXT UNIQUE NOT NULL,
      model_year INTEGER NOT NULL,
      make_model TEXT NOT NULL,
      capacity_quintals REAL NOT NULL,
      driver_id TEXT NOT NULL,
      driver_name TEXT NOT NULL,
      operational_status TEXT DEFAULT 'Available',
      mileage_km REAL NOT NULL,
      last_service_date TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS drivers (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      license_number TEXT UNIQUE NOT NULL,
      license_grade TEXT NOT NULL,
      phone TEXT NOT NULL,
      assigned_truck_plate TEXT NOT NULL,
      emergency_contact TEXT NOT NULL,
      status TEXT DEFAULT 'On Duty',
      trip_count INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS deliveries (
      id TEXT PRIMARY KEY,
      delivery_note_no TEXT NOT NULL,
      waybill_no TEXT UNIQUE NOT NULL,
      truck_id TEXT NOT NULL,
      plate_number TEXT NOT NULL,
      driver_name TEXT NOT NULL,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      cargo_type TEXT NOT NULL,
      cargo_quintals REAL NOT NULL,
      departure_time TEXT NOT NULL,
      estimated_arrival TEXT NOT NULL,
      delivery_status TEXT DEFAULT 'In Transit', -- 'Pending' | 'Assigned' | 'In Transit' | 'Delivered' | 'Cancelled'
      freight_charge_etb REAL NOT NULL,
      business_activity TEXT DEFAULT 'Transport',
      is_shared_truckload INTEGER DEFAULT 0,
      partner_carrier_name TEXT,
      partner_cargo_quintals REAL,
      partner_revenue_share_etb REAL,
      partner_company_name TEXT,
      total_freight_revenue_etb REAL,
      zarima_share_etb REAL,
      zarima_share_percentage REAL,
      partner_share_etb REAL,
      partner_share_percentage REAL,
      shared_arrangement_notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS maintenance_records (
      id TEXT PRIMARY KEY,
      truck_plate TEXT NOT NULL,
      service_type TEXT NOT NULL,
      date TEXT NOT NULL,
      workshop_name TEXT NOT NULL,
      cost_etb REAL NOT NULL,
      status TEXT DEFAULT 'Completed',
      next_service_due_km REAL NOT NULL,
      notes TEXT,
      business_activity TEXT DEFAULT 'Transport',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS fuel_expenses (
      id TEXT PRIMARY KEY,
      truck_plate TEXT NOT NULL,
      driver_name TEXT NOT NULL,
      date TEXT NOT NULL,
      fuel_liters REAL NOT NULL,
      price_per_liter_etb REAL NOT NULL,
      total_cost_etb REAL NOT NULL,
      station_name TEXT NOT NULL,
      current_odometer_km REAL NOT NULL,
      receipt_no TEXT NOT NULL,
      business_activity TEXT DEFAULT 'Transport',
      is_member_funded INTEGER DEFAULT 0,
      member_expense_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Cement Purchases, Sales Orders & Inventory
    CREATE TABLE IF NOT EXISTS cement_purchases (
      id TEXT PRIMARY KEY,
      purchase_order_no TEXT UNIQUE NOT NULL,
      supplier_id TEXT NOT NULL,
      supplier_name TEXT NOT NULL,
      cement_type TEXT NOT NULL,
      quantity_quintals REAL NOT NULL,
      unit_price_etb REAL NOT NULL,
      total_amount_etb REAL NOT NULL,
      factory_origin TEXT NOT NULL,
      delivery_status TEXT DEFAULT 'Received',
      payment_status TEXT DEFAULT 'Paid',
      order_date TEXT NOT NULL,
      assigned_truck TEXT,
      business_activity TEXT DEFAULT 'Cement',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cement_sales (
      id TEXT PRIMARY KEY,
      invoice_no TEXT UNIQUE NOT NULL,
      customer_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      cement_type TEXT NOT NULL,
      quantity_quintals REAL NOT NULL,
      unit_price_etb REAL NOT NULL,
      total_amount_etb REAL NOT NULL,
      payment_type TEXT NOT NULL,
      payment_status TEXT DEFAULT 'Paid',
      delivery_status TEXT DEFAULT 'Delivered',
      destination_city TEXT NOT NULL,
      sale_date TEXT NOT NULL,
      due_date TEXT,
      business_activity TEXT DEFAULT 'Cement',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cement_inventory (
      id TEXT PRIMARY KEY,
      warehouse_location TEXT NOT NULL,
      cement_type TEXT NOT NULL,
      current_stock_quintals REAL NOT NULL,
      min_threshold_quintals REAL NOT NULL,
      unit_cost_etb REAL NOT NULL,
      total_value_etb REAL NOT NULL,
      last_restocked_date TEXT NOT NULL,
      status TEXT DEFAULT 'Adequate',
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      tin_number TEXT NOT NULL,
      phone TEXT NOT NULL,
      city TEXT NOT NULL,
      credit_limit_etb REAL NOT NULL,
      outstanding_balance_etb REAL DEFAULT 0,
      payment_terms TEXT NOT NULL,
      total_purchased_ytd REAL DEFAULT 0,
      status TEXT DEFAULT 'Active'
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      contact_person TEXT NOT NULL,
      tin_number TEXT NOT NULL,
      phone TEXT NOT NULL,
      plant_location TEXT NOT NULL,
      total_purchased_ytd REAL DEFAULT 0,
      outstanding_payable_etb REAL DEFAULT 0,
      status TEXT DEFAULT 'Active'
    );

    CREATE TABLE IF NOT EXISTS payroll_entries (
      id TEXT PRIMARY KEY,
      payroll_month TEXT NOT NULL,
      employee_name TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT NOT NULL,
      gross_salary_etb REAL NOT NULL,
      income_tax_etb REAL NOT NULL,
      pension_etb REAL NOT NULL,
      net_salary_etb REAL NOT NULL,
      payment_status TEXT DEFAULT 'Paid',
      bank_reference TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS receivables (
      id TEXT PRIMARY KEY,
      invoice_no TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      issue_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      total_amount_etb REAL NOT NULL,
      amount_received_etb REAL NOT NULL,
      balance_due_etb REAL NOT NULL,
      status TEXT DEFAULT 'Current',
      business_activity TEXT DEFAULT 'Cement'
    );

    CREATE TABLE IF NOT EXISTS payables (
      id TEXT PRIMARY KEY,
      bill_no TEXT UNIQUE NOT NULL,
      vendor_or_payee TEXT NOT NULL,
      category TEXT NOT NULL,
      issue_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      total_amount_etb REAL NOT NULL,
      amount_paid_etb REAL NOT NULL,
      balance_due_etb REAL NOT NULL,
      status TEXT DEFAULT 'Approved for Payment',
      business_activity TEXT DEFAULT 'Shared',
      is_member_liability INTEGER DEFAULT 0,
      member_id TEXT
    );
  `)
  console.log('[SQLite] Zarima Trading database initialized at:', dbPath)
}
