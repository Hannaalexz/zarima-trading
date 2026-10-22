/**
 * Utility library for generating and downloading official CSV/Excel import templates
 * for Zarima Trading & Logistics ERP.
 * Includes UTF-8 BOM so Microsoft Excel opens files seamlessly without character corruption.
 */

interface TemplateDefinition {
  id: string
  title: string
  filename: string
  description: string
  category: 'Banking & Reconciliation' | 'Fleet & Transport' | 'Cement & Sales' | 'HR & Payroll'
  headers: string[]
  sampleRows: string[][]
}

export const IMPORT_TEMPLATES: Record<string, TemplateDefinition> = {
  bankStatement: {
    id: 'bankStatement',
    title: 'Bank Statement Import Template',
    filename: 'Zarima_Bank_Statement_Import_Template.csv',
    category: 'Banking & Reconciliation',
    description:
      'Official template for importing monthly/daily bank statements (CBE, Awash, Dashen, Abyssinia, etc.) into the automated reconciliation engine.',
    headers: [
      'Transaction Date (YYYY-MM-DD)',
      'Value Date (YYYY-MM-DD)',
      'Description / Narration',
      'Cheque / Wire Reference',
      'Debit (ETB)',
      'Credit (ETB)',
      'Running Balance (ETB)',
      'Counterparty Name',
      'Counterparty Account Number',
    ],
    sampleRows: [
      [
        '2026-10-01',
        '2026-10-01',
        'ANNUAL OPENING BALANCE CARRYFORWARD',
        'OPB-2026-CBE-01',
        '',
        '',
        '12540000.00',
        'Commercial Bank of Ethiopia',
        '1000123456789',
      ],
      [
        '2026-10-05',
        '2026-10-05',
        'WIRE TRF SINOTRUK ETHIOPIA AXLE SEALS',
        'CBE-MNT-2026-102',
        '65400.00',
        '',
        '12474600.00',
        'Sinotruk Ethiopia Authorized Hub',
        '100099882211',
      ],
      [
        '2026-10-10',
        '2026-10-10',
        'TOTALENERGIES AKAKI 10000 KM OIL SERVICE',
        'CBE-MNT-2026-103',
        '32000.00',
        '',
        '12442600.00',
        'TotalEnergies Truck Center Akaki',
        '100055443322',
      ],
      [
        '2026-10-14',
        '2026-10-14',
        'FT INWARD SUNSHINE CONST CUST INV-2026-382',
        'CBE-FT-88192301',
        '',
        '1056000.00',
        '13498600.00',
        'Sunshine Construction Plc',
        '013204958201',
      ],
      [
        '2026-10-15',
        '2026-10-15',
        'SEBETA BATTERY PAIR 200AH VOLVO FH440',
        'CBE-FP-2026-082',
        '56000.00',
        '',
        '13442600.00',
        'Sebeta Automotive Battery Co.',
        '100077889900',
      ],
      [
        '2026-10-16',
        '2026-10-16',
        'MONTHLY ELECTRONIC BANKING TAX & CHARGES',
        'FEE-2026-9912',
        '1450.00',
        '',
        '13441150.00',
        'Commercial Bank of Ethiopia',
        '1000123456789',
      ],
    ],
  },

  fleetOdometer: {
    id: 'fleetOdometer',
    title: 'Truck Odometer & Dispatch Mileage Template',
    filename: 'Zarima_Truck_Odometer_Trip_Import_Template.csv',
    category: 'Fleet & Transport',
    description:
      'Template for bulk updating commercial truck odometer readings, trip distances, and driver corridor logs for automated 10,000 km oil change alerts.',
    headers: [
      'Truck Plate Number',
      'Trip Date (YYYY-MM-DD)',
      'Current Odometer (km)',
      'Driver Full Name',
      'Origin Facility',
      'Destination Facility',
      'Cargo Category',
      'Cargo Payload (Quintals)',
      'Fuel Liters Added',
      'Trip Dispatch Notes',
    ],
    sampleRows: [
      [
        '3-ET-A41920 AA',
        '2026-10-22',
        '142800',
        'Kassahun Tadesse',
        'Dangote Plant (Muger)',
        'Addis Ababa Central Depot',
        'Zarima Cement',
        '700',
        '350',
        'Odometer crossed 140k service interval - 10k oil change alert triggered',
      ],
      [
        '3-ET-B82910 AA',
        '2026-10-22',
        '98400',
        'Mohammed Seid',
        'Koye Feche Quarry',
        'Ayat Residential Phase 4',
        'Sand & Aggregates',
        '750',
        '420',
        'Bulk powder blower discharge calibrated to 2.2 bar',
      ],
      [
        '3-ET-C10928 AA',
        '2026-10-22',
        '215300',
        'Berhanu Wolde',
        'Derba Plant',
        'Hawassa Commercial Complex',
        'Zarima Cement',
        '750',
        '300',
        'Fresh 10,000 km service completed at 210,000 km - 4,700 km remaining',
      ],
      [
        '3-ET-D55012 AA',
        '2026-10-22',
        '284100',
        'Alemayehu Bogale',
        'National Cement (Dire Dawa)',
        'Modjo Dry Port Multi-Modal',
        'Third-Party Cement',
        '850',
        '380',
        'Long-haul heavy corridor trip completed',
      ],
    ],
  },

  cementPurchase: {
    id: 'cementPurchase',
    title: 'Cement Factory Purchases Import Template',
    filename: 'Zarima_Cement_Factory_Purchase_Import_Template.csv',
    category: 'Cement & Sales',
    description:
      'Template for bulk registering cement factory procurement orders from Derba, Dangote, National, and Habesha cement plants.',
    headers: [
      'Purchase Invoice Number',
      'Order Date (YYYY-MM-DD)',
      'Factory Supplier Name',
      'Cement Type Grade',
      'Quantity (Quintals)',
      'Unit Purchase Price (ETB)',
      'Total Amount (ETB)',
      'Receiving Warehouse / Depot',
      'Assigned Truck Plate',
      'Delivery Status (Received / In Transit)',
      'Payment Status (Paid / Partial / Credit)',
    ],
    sampleRows: [
      [
        'PI-2026-901',
        '2026-10-18',
        'Derba MIDROC Cement Plc',
        'PPC 32.5R',
        '1800',
        '1140',
        '2052000',
        'Kality Central Cement Depot',
        '3-ET-A41920 AA',
        'Received',
        'Paid',
      ],
      [
        'PI-2026-902',
        '2026-10-19',
        'Dangote Cement (Ethiopia) Plc',
        'OPC 42.5N',
        '1200',
        '1350',
        '1620000',
        'Bole Lemi Industrial Depot',
        '3-ET-B82910 AA',
        'Received',
        'Paid',
      ],
      [
        'PI-2026-903',
        '2026-10-20',
        'National Cement Share Company',
        'Bulk Cement 42.5R',
        '2400',
        '1280',
        '3072000',
        'Modjo Dry Port Terminal',
        '3-ET-D55012 AA',
        'In Transit',
        'Paid',
      ],
    ],
  },

  salesInvoices: {
    id: 'salesInvoices',
    title: 'Wholesale Sales Invoices Import Template',
    filename: 'Zarima_Sales_Invoices_Import_Template.csv',
    category: 'Cement & Sales',
    description:
      'Template for importing wholesale customer sales orders, contractor dispatches, and delivery fee invoices.',
    headers: [
      'Invoice Number',
      'Invoice Date (YYYY-MM-DD)',
      'Customer Full Name',
      'Customer Classification (Usual / New)',
      'Cement Type Grade',
      'Quantity (Quintals)',
      'Unit Selling Price (ETB)',
      'Delivery Freight Fee (ETB)',
      'Grand Total Amount (ETB)',
      'Dispatched Truck Plate',
      'Payment Status (Paid / Credit)',
    ],
    sampleRows: [
      [
        'INV-2026-440',
        '2026-10-20',
        'Sunshine Construction Plc',
        'Usual',
        'PPC 32.5R',
        '800',
        '1320',
        '80000',
        '1136000',
        '3-ET-A41920 AA',
        'Paid',
      ],
      [
        'INV-2026-441',
        '2026-10-21',
        'Flintstone Engineering',
        'Usual',
        'OPC 42.5N',
        '600',
        '1480',
        '60000',
        '948000',
        '3-ET-C10928 AA',
        'Paid',
      ],
      [
        'INV-2026-442',
        '2026-10-22',
        'Noah Real Estate Project Phase 4',
        'New',
        'Bulk Cement 42.5R',
        '1000',
        '1420',
        '100000',
        '1520000',
        '3-ET-B82910 AA',
        'Credit',
      ],
    ],
  },

  maintenanceParts: {
    id: 'maintenanceParts',
    title: 'Fleet Maintenance & Parts Procurement Template',
    filename: 'Zarima_Fleet_Maintenance_Spare_Parts_Import_Template.csv',
    category: 'Fleet & Transport',
    description:
      'Template for workshop maintenance bills, commercial tire procurements, heavy batteries, lubricants, and journal disbursement references.',
    headers: [
      'Date (YYYY-MM-DD)',
      'Invoice / Receipt Number',
      'Commercial Truck Plate',
      'Record Type (Maintenance / Fleet Purchase)',
      'Category (Tires / Batteries / Spare Parts / Lubricants)',
      'Item or Service Description',
      'Workshop or Supplier Name',
      'Quantity',
      'Unit Rate (ETB)',
      'Total Cost (ETB)',
      'Paying Company Bank Account',
      'Disbursement Wire Reference',
      'Technical Notes',
    ],
    sampleRows: [
      [
        '2026-10-16',
        'MNT-2026-104',
        '3-ET-E33819 AA',
        'Maintenance',
        'Spare Parts',
        'Hydraulic Brake Booster Overhaul & Calipers',
        'Kality Central Workshop',
        '1',
        '48500',
        '48500',
        'Commercial Bank of Ethiopia',
        'CBE-MNT-2026-104',
        'Debit: 5200 Truck Maintenance / Credit: 1010 CBE',
      ],
      [
        '2026-10-17',
        'FP-INV-081',
        '3-ET-A41920 AA',
        'Fleet Purchase',
        'Tires',
        'Bridgestone Heavy Hauler Tires 315/80R22.5',
        'Horizon Tyre SC (Addis Ababa)',
        '4',
        '38500',
        '154000',
        'Commercial Bank of Ethiopia',
        'CBE-FP-2026-081',
        'Debit: 5210 Spare Parts & Tires / Credit: 1010 CBE',
      ],
      [
        '2026-10-18',
        'MNT-2026-105',
        '3-ET-C10928 AA',
        'Maintenance',
        'Lubricants',
        '10,000 km Scheduled Engine Oil & Dual Filters',
        'TotalEnergies Truck Center Akaki',
        '1',
        '32000',
        '32000',
        'Commercial Bank of Ethiopia',
        'CBE-MNT-2026-105',
        'Scheduled 10k km preventive oil change',
      ],
    ],
  },

  payrollRoster: {
    id: 'payrollRoster',
    title: 'Staff Payroll & Driver Allowances Template',
    filename: 'Zarima_Staff_Payroll_Import_Template.csv',
    category: 'HR & Payroll',
    description:
      'Template for monthly staff gross payout, heavy commercial driver highway per diems, and bank disbursement account numbers.',
    headers: [
      'Payroll Month (YYYY-MM)',
      'Employee Code',
      'Employee Full Name',
      'Job Title / Grade',
      'Base Salary (ETB)',
      'Transport & Housing Allowance (ETB)',
      'Highway Trip Per-Diem (ETB)',
      'Gross Company Deduction (ETB)',
      'Disbursing Company Bank',
      'Employee Bank Account Number',
      'Driver Assigned Plate Number',
    ],
    sampleRows: [
      [
        '2026-10',
        'DRV-001',
        'Kassahun Tadesse',
        'Grade 5 Heavy Commercial Driver',
        '22500',
        '3500',
        '18500',
        '44500',
        'Commercial Bank of Ethiopia',
        '100099120412',
        '3-ET-A41920 AA',
      ],
      [
        '2026-10',
        'DRV-002',
        'Mohammed Seid',
        'Grade 5 Tanker Certified Driver',
        '24000',
        '3500',
        '16500',
        '44000',
        'Commercial Bank of Ethiopia',
        '100088231945',
        '3-ET-B82910 AA',
      ],
      [
        '2026-10',
        'STF-001',
        'Bethlehem Tsegaye',
        'Chief Finance Partner & Treasury',
        '45000',
        '5000',
        '0',
        '50000',
        'Commercial Bank of Ethiopia',
        '100012938475',
        '',
      ],
    ],
  },
}

/**
 * Generates and triggers download of a CSV template with UTF-8 BOM encoding
 */
export function downloadImportTemplate(templateKey: keyof typeof IMPORT_TEMPLATES) {
  const template = IMPORT_TEMPLATES[templateKey]
  if (!template) {
    console.error(`Template ${templateKey} not found.`)
    return
  }

  // Construct CSV content with RFC4180 escaping
  const formatCell = (val: string) => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`
    }
    return val
  }

  const headerLine = template.headers.map(formatCell).join(',')
  const rowLines = template.sampleRows.map((row) => row.map(formatCell).join(','))
  const csvContent = [headerLine, ...rowLines].join('\r\n')

  // Prepend UTF-8 BOM (\uFEFF) so Excel opens UTF-8 text properly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', template.filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
