import { Router } from 'express'
import { db } from '../db.js'

export const cementRouter = Router()

// -------------------------------------------------------------
// INVENTORY
// -------------------------------------------------------------
cementRouter.get('/inventory', (req, res) => {
  try {
    const items = db.prepare('SELECT * FROM cement_inventory').all()
    const mapped = items.map((i) => ({
      id: i.id,
      warehouseLocation: i.warehouse_location,
      cementType: i.cement_type,
      currentStockQuintals: i.current_stock_quintals,
      minThresholdQuintals: i.min_threshold_quintals,
      unitCostETB: i.unit_cost_etb,
      totalValueETB: i.total_value_etb,
      lastRestockedDate: i.last_restocked_date,
      status: i.status,
    }))
    res.json(mapped)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// -------------------------------------------------------------
// PURCHASES INVOICES (RECEIVED INTO INVENTORY)
// -------------------------------------------------------------
cementRouter.get('/purchases', (req, res) => {
  try {
    const purchases = db.prepare('SELECT * FROM cement_purchases ORDER BY order_date DESC').all()
    const mapped = purchases.map((p) => ({
      id: p.id,
      purchaseOrderNo: p.purchase_order_no,
      purchaseInvoiceNo: p.purchase_order_no,
      supplierId: p.supplier_id,
      supplierName: p.supplier_name,
      cementType: p.cement_type,
      quantityQuintals: p.quantity_quintals,
      unitPriceETB: p.unit_price_etb,
      totalAmountETB: p.total_amount_etb,
      factoryOrigin: p.factory_origin,
      warehouseLocation: p.factory_origin ? `${p.factory_origin} (Depot)` : 'Addis Ababa Central Depot (Kality)',
      deliveryStatus: p.delivery_status || 'Received',
      paymentStatus: p.payment_status,
      orderDate: p.order_date,
      receivedDate: p.order_date,
      assignedTruck: p.assigned_truck,
      businessActivity: p.business_activity,
    }))
    res.json(mapped)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

cementRouter.post('/purchases', (req, res) => {
  try {
    const {
      purchaseInvoiceNo,
      purchaseOrderNo,
      supplierId,
      supplierName,
      cementType,
      quantityQuintals,
      unitPriceETB,
      totalAmountETB,
      factoryOrigin,
      warehouseLocation = 'Addis Ababa Central Depot (Kality)',
      deliveryStatus = 'Received',
      paymentStatus = 'Paid',
      orderDate,
      assignedTruck,
    } = req.body

    const id = `PI-${Date.now()}`
    const invoiceNum = purchaseInvoiceNo || purchaseOrderNo || `PI-2026-${Math.floor(100 + Math.random() * 900)}`
    const qty = Number(quantityQuintals)
    const price = Number(unitPriceETB)
    const total = Number(totalAmountETB) || qty * price
    const date = orderDate || new Date().toISOString().split('T')[0]

    db.exec('BEGIN TRANSACTION;')
    try {
      // 1. Insert Purchases Invoice (marked received upon reaching inventory)
      db.prepare(`
        INSERT INTO cement_purchases (
          id, purchase_order_no, supplier_id, supplier_name, cement_type,
          quantity_quintals, unit_price_etb, total_amount_etb, factory_origin,
          delivery_status, payment_status, order_date, assigned_truck, business_activity
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Cement')
      `).run(
        id, invoiceNum, supplierId || 'SUP-001', supplierName, cementType,
        qty, price, total,
        factoryOrigin || warehouseLocation, deliveryStatus, paymentStatus, date, assignedTruck || null
      )

      // 2. Increment stock in warehouse inventory
      const existingInv = db.prepare(`
        SELECT * FROM cement_inventory 
        WHERE cement_type = ? AND warehouse_location = ?
      `).get(cementType, warehouseLocation)

      if (existingInv) {
        const newStock = existingInv.current_stock_quintals + qty
        const newTotalVal = newStock * existingInv.unit_cost_etb
        const newStatus = newStock < existingInv.min_threshold_quintals ? 'Low Stock' : 'Adequate'
        db.prepare(`
          UPDATE cement_inventory 
          SET current_stock_quintals = ?, total_value_etb = ?, last_restocked_date = ?, status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(newStock, newTotalVal, date, newStatus, existingInv.id)
      } else {
        const newInvId = `INV-DEP-${Date.now()}`
        db.prepare(`
          INSERT INTO cement_inventory (
            id, warehouse_location, cement_type, current_stock_quintals, min_threshold_quintals, unit_cost_etb, total_value_etb, last_restocked_date, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Adequate')
        `).run(newInvId, warehouseLocation, cementType, qty, 1000, price, total, date)
      }

      db.exec('COMMIT;')
      const created = db.prepare('SELECT * FROM cement_purchases WHERE id = ?').get(id)
      res.status(201).json(created)
    } catch (innerErr) {
      db.exec('ROLLBACK;')
      throw innerErr
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// -------------------------------------------------------------
// SALES INVOICES (USUAL & NEW CUSTOMERS)
// -------------------------------------------------------------
cementRouter.get('/sales', (req, res) => {
  try {
    const sales = db.prepare('SELECT * FROM cement_sales ORDER BY sale_date DESC').all()
    const mapped = sales.map((s) => ({
      id: s.id,
      invoiceNo: s.invoice_no,
      customerId: s.customer_id,
      customerName: s.customer_name,
      customerType: s.customer_name?.includes('Noah') ? 'New' : 'Usual',
      cementType: s.cement_type,
      quantityQuintals: s.quantity_quintals,
      unitPriceETB: s.unit_price_etb,
      totalAmountETB: s.total_amount_etb,
      paymentType: s.payment_type,
      paymentStatus: s.payment_status,
      deliveryStatus: s.delivery_status,
      destinationCity: s.destination_city,
      warehouseLocation: 'Addis Ababa Central Depot (Kality)',
      saleDate: s.sale_date,
      dueDate: s.due_date,
      businessActivity: s.business_activity,
    }))
    res.json(mapped)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

cementRouter.post('/sales', (req, res) => {
  try {
    const {
      invoiceNo,
      customerId,
      customerName,
      customerType = 'Usual',
      cementType,
      quantityQuintals,
      unitPriceETB,
      totalAmountETB,
      paymentType,
      paymentStatus = 'Paid',
      deliveryStatus = 'Delivered',
      destinationCity,
      warehouseLocation = 'Addis Ababa Central Depot (Kality)',
      saleDate,
      dueDate,
      newCustomerDetails,
    } = req.body

    const id = `SO-${Date.now()}`
    const invNo = invoiceNo || `INV-2026-${Math.floor(400 + Math.random() * 500)}`
    const qty = Number(quantityQuintals)
    const price = Number(unitPriceETB)
    const total = Number(totalAmountETB) || qty * price
    const date = saleDate || new Date().toISOString().split('T')[0]

    db.exec('BEGIN TRANSACTION;')
    try {
      let finalCustId = customerId
      let finalCustName = customerName

      // If new customer details provided, register customer into customers table
      if (newCustomerDetails && (customerType === 'New' || !customerId)) {
        finalCustId = `CUST-${Date.now()}`
        finalCustName = newCustomerDetails.company || customerName
        db.prepare(`
          INSERT INTO customers (
            id, name, company, tin_number, phone, city, credit_limit_etb, outstanding_balance_etb, payment_terms, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')
        `).run(
          finalCustId,
          newCustomerDetails.name || finalCustName,
          finalCustName,
          newCustomerDetails.tinNumber || '0000000000',
          newCustomerDetails.phone || '+251 91 000 0000',
          newCustomerDetails.city || destinationCity || 'Addis Ababa',
          Number(newCustomerDetails.creditLimitETB) || 0,
          paymentStatus === 'Outstanding' ? total : 0,
          newCustomerDetails.paymentTerms || paymentType || 'Cash on Delivery'
        )
      } else if (customerId && paymentStatus === 'Outstanding') {
        db.prepare(`
          UPDATE customers SET outstanding_balance_etb = outstanding_balance_etb + ? WHERE id = ?
        `).run(total, customerId)
      }

      // 1. Insert sales invoice
      db.prepare(`
        INSERT INTO cement_sales (
          id, invoice_no, customer_id, customer_name, cement_type,
          quantity_quintals, unit_price_etb, total_amount_etb, payment_type,
          payment_status, delivery_status, destination_city, sale_date, due_date, business_activity
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Cement')
      `).run(
        id, invNo, finalCustId, finalCustName, cementType,
        qty, price, total,
        paymentType, paymentStatus, deliveryStatus, destinationCity, date, dueDate || null
      )

      // 2. Decrement warehouse inventory stock
      const existingInv = db.prepare(`
        SELECT * FROM cement_inventory 
        WHERE cement_type = ? AND warehouse_location = ?
      `).get(cementType, warehouseLocation)

      if (existingInv) {
        const newStock = Math.max(0, existingInv.current_stock_quintals - qty)
        const newTotalVal = newStock * existingInv.unit_cost_etb
        const newStatus =
          newStock === 0 ? 'Critical' : newStock < existingInv.min_threshold_quintals ? 'Low Stock' : 'Adequate'
        db.prepare(`
          UPDATE cement_inventory 
          SET current_stock_quintals = ?, total_value_etb = ?, status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(newStock, newTotalVal, newStatus, existingInv.id)
      }

      db.exec('COMMIT;')
      const created = db.prepare('SELECT * FROM cement_sales WHERE id = ?').get(id)
      res.status(201).json(created)
    } catch (innerErr) {
      db.exec('ROLLBACK;')
      throw innerErr
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// -------------------------------------------------------------
// CUSTOMERS & SUPPLIERS
// -------------------------------------------------------------
cementRouter.get('/customers', (req, res) => {
  try {
    const customers = db.prepare('SELECT * FROM customers ORDER BY name ASC').all()
    const mapped = customers.map((c) => ({
      ...c,
      isUsual: !c.company?.includes('Noah') && !c.name?.includes('Noah'),
      customerCategory: (!c.company?.includes('Noah') && !c.name?.includes('Noah')) ? 'Usual Customer' : 'New Customer',
    }))
    res.json(mapped)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

cementRouter.post('/customers', (req, res) => {
  try {
    const {
      name,
      company,
      tinNumber,
      phone,
      city = 'Addis Ababa',
      creditLimitETB = 0,
      paymentTerms = 'Cash on Delivery',
      status = 'Active',
    } = req.body
    const id = `CUST-${Date.now()}`
    db.prepare(`
      INSERT INTO customers (
        id, name, company, tin_number, phone, city, credit_limit_etb, outstanding_balance_etb, payment_terms, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `).run(id, name, company, tinNumber, phone, city, Number(creditLimitETB), paymentTerms, status)
    const created = db.prepare('SELECT * FROM customers WHERE id = ?').get(id)
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

cementRouter.get('/suppliers', (req, res) => {
  try {
    const suppliers = db.prepare('SELECT * FROM suppliers ORDER BY name ASC').all()
    res.json(suppliers)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
