import { db, initDatabase } from './db.js'

export function seedDatabase() {
  initDatabase()

  const memberCount = db.prepare('SELECT COUNT(*) as count FROM members').get().count
  if (memberCount > 0) {
    console.log('[Seed] Database already contains records. Skipping seed.')
    return
  }

  console.log('[Seed] Seeding Zarima Trading ERP initial database...')

  // 1. Members
  const insertMember = db.prepare(`
    INSERT INTO members (id, name, role, phone, email, total_funded_etb, total_reimbursed_etb, outstanding_balance_etb)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  insertMember.run('MEM-001', 'Dawit Haile', 'Managing Partner & Co-Founder', '+251 91 144 5566', 'dawit.haile@zarima-trading.et', 124500, 45000, 79500)
  insertMember.run('MEM-002', 'Bethlehem Tefera', 'Finance Director & Partner', '+251 91 233 7788', 'bethlehem.t@zarima-trading.et', 86000, 30000, 56000)
  insertMember.run('MEM-003', 'Tewodros Kassahun', 'Fleet Operations Partner', '+251 91 388 9900', 'tewodros.k@zarima-trading.et', 98000, 40000, 58000)

  // 2. Member Expenses
  const insertExpense = db.prepare(`
    INSERT INTO member_expenses (
      id, expense_number, member_id, member_name, date, amount_etb, currency, category,
      business_activity, description, business_purpose, supplier_or_payee, related_entity_id,
      related_entity_type, approval_status, reimbursement_status, amount_reimbursed_etb,
      remaining_owed_etb, receipt_file_name, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  insertExpense.run(
    'MEXP-2026-001', 'EXP-MEM-0089', 'MEM-001', 'Dawit Haile', '2026-09-14', 20000, 'ETB',
    'Fuel', 'Transport', 'Urgent diesel refueling for Hauler 3-ET-A41920 at Mojo Shell',
    'Driver was stranded outside Mojo terminal after midnight bank cutoff', 'TotalEnergies Mojo',
    'TRK-01', 'Truck', 'Approved', 'Partially Reimbursed', 5000, 15000, 'receipt-fuel-41920.pdf',
    'Approved by Bethlehem. Reimbursed 5,000 ETB via CBE; 15,000 ETB outstanding.'
  )

  insertExpense.run(
    'MEXP-2026-002', 'EXP-MEM-0090', 'MEM-003', 'Tewodros Kassahun', '2026-09-18', 35000, 'ETB',
    'Truck Maintenance', 'Transport', 'Heavy duty clutch assembly & brake drums for TRK-03 (Howo A7)',
    'Emergency workshop turnaround to meet Dangote cement uplift quota', 'Kality Heavy Parts Wholesale',
    'TRK-03', 'Truck', 'Approved', 'Unreimbursed', 0, 35000, 'kality-parts-invoice.pdf',
    'Approved. Awaiting next weekly treasury reimbursement run.'
  )

  insertExpense.run(
    'MEXP-2026-003', 'EXP-MEM-0091', 'MEM-002', 'Bethlehem Tefera', '2026-09-21', 18500, 'ETB',
    'Office Supplies', 'Shared', 'Accounting audit software licensing renewal & high-volume laser toner',
    'Finance department month-end ledger audits and tax filings', 'Gulf Tech Solutions Addis',
    null, 'Shared Overhead', 'Approved', 'Fully Reimbursed', 18500, 0, 'gulf-tech-receipt.pdf',
    'Fully settled from Awash operating account on Sept 23.'
  )

  // 3. Member Reimbursements
  const insertReimb = db.prepare(`
    INSERT INTO member_reimbursements (
      id, expense_id, member_id, reimbursement_date, amount_etb, bank_account_id,
      bank_account_name, bank_reference, payment_method, disbursed_by, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  insertReimb.run(
    'REIMB-001', 'MEXP-2026-001', 'MEM-001', '2026-09-16', 5000, 'BANK-01',
    'Commercial Bank of Ethiopia (CBE)', 'CBE-TRF-994821', 'Bank Transfer', 'Bethlehem Tefera',
    'First tranche reimbursement for emergency fuel outlay'
  )

  insertReimb.run(
    'REIMB-002', 'MEXP-2026-003', 'MEM-002', '2026-09-23', 18500, 'BANK-02',
    'Awash Bank - Wholesale Cement Clearing', 'AWB-TX-55190', 'Bank Transfer', 'Dawit Haile',
    'Full settlement of audit & software overhead'
  )

  // 4. 10 Bank Accounts
  const insertAccount = db.prepare(`
    INSERT INTO bank_accounts (id, bank_name, account_number, branch_name, account_type, balance_etb, last_reconciled_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const accounts = [
    ['BANK-01', 'Commercial Bank of Ethiopia (CBE)', '1000123456789', 'Addis Ababa Main Branch', 'Current Account', 18445000, '2026-09-25', 'Active'],
    ['BANK-02', 'Awash Bank', '01320495820100', 'Bole Medhanialem Branch', 'Current Account', 12181500, '2026-09-25', 'Active'],
    ['BANK-03', 'Bank of Abyssinia', '449102938401', 'Kazanchis Commercial Center', 'Letter of Credit (LC) Escrow', 8750000, '2026-09-24', 'Active'],
    ['BANK-04', 'Dashen Bank', '502910394819', 'Mexico Square Branch', 'Current Account', 4320000, '2026-09-24', 'Active'],
    ['BANK-05', 'Cooperative Bank of Oromia', '109283746519', 'Muger Plant Branch', 'Current Account', 6150000, '2026-09-23', 'Active'],
    ['BANK-06', 'Nib International Bank', '302918273645', 'Kality Industrial Zone', 'Letter of Credit (LC) Escrow', 9800000, '2026-09-20', 'Active'],
    ['BANK-07', 'United Bank (Hibret)', '201928374650', 'Stadium Business Hub', 'Savings', 2950000, '2026-09-22', 'Active'],
    ['BANK-08', 'Zemen Bank', '601928374619', 'Ras Abebe Aregay Street', 'Savings', 15400000, '2026-09-25', 'Active'],
    ['BANK-09', 'Oromia International Bank', '701928374610', 'Adama Express Center', 'Current Account', 3880000, '2026-09-21', 'Active'],
    ['BANK-10', 'Telebirr SuperApp Merchant', 'TB-MERCH-882910', 'Fintech Digital Gateway', 'Current Account', 1450000, '2026-09-25', 'Active'],
  ]

  for (const acc of accounts) {
    insertAccount.run(...acc)
  }

  // 5. Fleet Trucks
  const insertTruck = db.prepare(`
    INSERT INTO trucks (id, plate_number, model_year, make_model, capacity_quintals, driver_id, driver_name, operational_status, mileage_km, last_service_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  insertTruck.run('TRK-01', '3-ET-A41920', 2022, 'Sinotruk Howo 371', 700, 'DRV-001', 'Kassahun Worku', 'Active Trip', 142850, '2026-08-15')
  insertTruck.run('TRK-02', '3-ET-A58291', 2023, 'Shacman F3000 Dump', 650, 'DRV-002', 'Mulugeta Bekele', 'Available', 98400, '2026-09-02')
  insertTruck.run('TRK-03', '3-ET-B19283', 2021, 'Volvo FMX 440 Hauler', 800, 'DRV-003', 'Girum Tadesse', 'In Maintenance', 215300, '2026-09-18')
  insertTruck.run('TRK-04', '3-ET-C38472', 2024, 'Mercedes-Benz Actros 3340', 750, 'DRV-004', 'Yohannes Desta', 'Active Trip', 48200, '2026-08-28')

  // 6. Drivers
  const insertDriver = db.prepare(`
    INSERT INTO drivers (id, full_name, license_number, license_grade, phone, assigned_truck_plate, emergency_contact, status, trip_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  insertDriver.run('DRV-001', 'Kassahun Worku', 'DL-ETH-849201', 'Grade 5 Heavy Commercial', '+251 91 192 8374', '3-ET-A41920', '+251 92 233 4455 (Spouse)', 'On Duty', 142)
  insertDriver.run('DRV-002', 'Mulugeta Bekele', 'DL-ETH-729182', 'Grade 5 Heavy Commercial', '+251 91 384 9201', '3-ET-A58291', '+251 91 445 6677 (Brother)', 'On Duty', 118)
  insertDriver.run('DRV-003', 'Girum Tadesse', 'DL-ETH-618293', 'Grade 5 Heavy Commercial', '+251 92 485 7192', '3-ET-B19283', '+251 93 556 7788 (Uncle)', 'Off Duty', 189)
  insertDriver.run('DRV-004', 'Yohannes Desta', 'DL-ETH-938201', 'Grade 5 Heavy Commercial', '+251 91 582 9102', '3-ET-C38472', '+251 92 667 8899 (Father)', 'On Duty', 64)

  // 7. Deliveries with Shared Truckload Arrangements
  const insertDelivery = db.prepare(`
    INSERT INTO deliveries (
      id, delivery_note_no, waybill_no, truck_id, plate_number, driver_name,
      origin, destination, cargo_type, cargo_quintals, departure_time,
      estimated_arrival, delivery_status, freight_charge_etb, business_activity,
      is_shared_truckload, partner_carrier_name, partner_cargo_quintals, partner_revenue_share_etb
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  insertDelivery.run(
    'DEL-001', 'DN-8492', 'WB-ET-2026-4401', 'TRK-01', '3-ET-A41920', 'Kassahun Worku',
    'Dangote Plant (Muger)', 'Addis Ababa Central Depot', 'OPC 42.5N Cement', 450,
    '2026-09-24T06:30:00Z', '2026-09-24T14:00:00Z', 'In Transit', 95000, 'Transport',
    1, 'Ethio-Djibouti Freight Alliance', 250, 55000
  )

  insertDelivery.run(
    'DEL-002', 'DN-8493', 'WB-ET-2026-4402', 'TRK-04', '3-ET-C38472', 'Yohannes Desta',
    'Derba MIDROC (Muger)', 'Adama Construction Hub', 'Bulk Cement Tanker', 750,
    '2026-09-24T08:00:00Z', '2026-09-24T16:30:00Z', 'In Transit', 165000, 'Transport',
    0, null, null, null
  )

  insertDelivery.run(
    'DEL-003', 'DN-8490', 'WB-ET-2026-4399', 'TRK-02', '3-ET-A58291', 'Mulugeta Bekele',
    'Habesha Cement (Holeta)', 'Kality Central Depot', 'PPC 32.5R Cement', 400,
    '2026-09-23T05:00:00Z', '2026-09-23T11:45:00Z', 'Delivered', 84000, 'Transport',
    1, 'Rift Valley Haulers Co-op', 250, 48000
  )

  // 8. Cement Inventory
  const insertInventory = db.prepare(`
    INSERT INTO cement_inventory (id, warehouse_location, cement_type, current_stock_quintals, min_threshold_quintals, unit_cost_etb, total_value_etb, last_restocked_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  insertInventory.run('INV-01', 'Kality Central Depot (Addis)', 'OPC 42.5N', 4850, 1500, 1020, 4947000, '2026-09-23', 'Adequate')
  insertInventory.run('INV-02', 'Kality Central Depot (Addis)', 'PPC 32.5R', 3200, 1200, 890, 2848000, '2026-09-22', 'Adequate')
  insertInventory.run('INV-03', 'Adama Regional Warehouse', 'OPC 42.5N', 1950, 1000, 1035, 2018250, '2026-09-20', 'Adequate')
  insertInventory.run('INV-04', 'Muger Depot Transit Yard', 'Bulk Cement', 680, 800, 940, 639200, '2026-09-18', 'Low Stock')

  // 9. Customers
  const insertCustomer = db.prepare(`
    INSERT INTO customers (id, name, company, tin_number, phone, city, credit_limit_etb, outstanding_balance_etb, payment_terms, total_purchased_ytd, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  insertCustomer.run('CUST-001', 'Eng. Teklehaimanot G.', 'Midroc Construction Ethiopia', '0019283746', '+251 91 123 4567', 'Addis Ababa', 15000000, 3450000, 'Credit 30 Days', 38200000, 'Active')
  insertCustomer.run('CUST-002', 'Ato Birhanu Wolde', 'Afro-Tsion Construction PLC', '0029384756', '+251 91 234 5678', 'Addis Ababa', 8000000, 1280000, 'Credit 30 Days', 19400000, 'Active')
  insertCustomer.run('CUST-003', 'W/ro Selamawit Alemu', 'Sunshine Real Estate Hub', '0039485761', '+251 91 345 6789', 'Addis Ababa', 12000000, 0, 'Bank Transfer', 24800000, 'Active')

  // 10. Suppliers
  const insertSupplier = db.prepare(`
    INSERT INTO suppliers (id, name, contact_person, tin_number, phone, plant_location, total_purchased_ytd, outstanding_payable_etb, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  insertSupplier.run('SUP-01', 'Dangote Cement Ethiopia PLC', 'Ato Mengistu Haile (Sales VP)', '0001928374', '+251 11 284 9000', 'Mugher, Oromia', 84500000, 6200000, 'Active')
  insertSupplier.run('SUP-02', 'Derba MIDROC Cement PLC', 'W/ro Aster Kassa (Supply Head)', '0002837465', '+251 11 122 3344', 'Derba, Muger', 52300000, 3800000, 'Active')
  insertSupplier.run('SUP-03', 'Habesha Cement Share Company', 'Ato Girma Belay (Depot Coordinator)', '0003948576', '+251 11 465 7890', 'Holeta, Oromia', 34800000, 1450000, 'Active')

  console.log('[Seed] Database successfully populated with initial ERP records!')
}
