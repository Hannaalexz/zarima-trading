import { Router } from 'express'
import { db } from '../db.js'

export const fleetRouter = Router()

// -------------------------------------------------------------
// TRUCKS
// -------------------------------------------------------------
fleetRouter.get('/trucks', (req, res) => {
  try {
    const trucks = db.prepare('SELECT * FROM trucks ORDER BY plate_number ASC').all()
    res.json(trucks)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

fleetRouter.post('/trucks', (req, res) => {
  try {
    const { plateNumber, modelYear, makeModel, capacityQuintals, driverId, driverName, operationalStatus = 'Available', mileageKm } = req.body
    const id = `TRK-${Date.now()}`
    const lastServiceDate = new Date().toISOString().split('T')[0]

    db.prepare(`
      INSERT INTO trucks (id, plate_number, model_year, make_model, capacity_quintals, driver_id, driver_name, operational_status, mileage_km, last_service_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, plateNumber, Number(modelYear), makeModel, Number(capacityQuintals), driverId, driverName, operationalStatus, Number(mileageKm), lastServiceDate)

    const created = db.prepare('SELECT * FROM trucks WHERE id = ?').get(id)
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

fleetRouter.patch('/trucks/:id/status', (req, res) => {
  try {
    const { status } = req.body
    db.prepare('UPDATE trucks SET operational_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id)
    const updated = db.prepare('SELECT * FROM trucks WHERE id = ?').get(req.params.id)
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// -------------------------------------------------------------
// DRIVERS
// -------------------------------------------------------------
fleetRouter.get('/drivers', (req, res) => {
  try {
    const drivers = db.prepare('SELECT * FROM drivers ORDER BY full_name ASC').all()
    res.json(drivers)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

fleetRouter.post('/drivers', (req, res) => {
  try {
    const { fullName, licenseNumber, licenseGrade, phone, assignedTruckPlate, emergencyContact, status = 'On Duty' } = req.body
    const id = `DRV-${Date.now()}`

    db.prepare(`
      INSERT INTO drivers (id, full_name, license_number, license_grade, phone, assigned_truck_plate, emergency_contact, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, fullName, licenseNumber, licenseGrade, phone, assignedTruckPlate, emergencyContact, status)

    const created = db.prepare('SELECT * FROM drivers WHERE id = ?').get(id)
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// -------------------------------------------------------------
// DELIVERIES & SHARED TRUCKLOAD MANIFESTS
// -------------------------------------------------------------
fleetRouter.get('/deliveries', (req, res) => {
  try {
    const deliveries = db.prepare('SELECT * FROM deliveries ORDER BY created_at DESC').all()
    // Map to camelCase format
    const formatted = deliveries.map((d) => ({
      id: d.id,
      deliveryNoteNo: d.delivery_note_no,
      waybillNo: d.waybill_no,
      truckId: d.truck_id,
      plateNumber: d.plate_number,
      driverName: d.driver_name,
      origin: d.origin,
      destination: d.destination,
      cargoType: d.cargo_type,
      cargoQuintals: d.cargo_quintals,
      departureTime: d.departure_time,
      estimatedArrival: d.estimated_arrival,
      deliveryStatus: d.delivery_status,
      freightChargeETB: d.freight_charge_etb,
      businessActivity: d.business_activity,
      isSharedTruckload: Boolean(d.is_shared_truckload),
      partnerCarrierName: d.partner_carrier_name,
      partnerCargoQuintals: d.partner_cargo_quintals,
      partnerRevenueShareETB: d.partner_revenue_share_etb,
      partnerCompanyName: d.partner_company_name,
      totalFreightRevenueETB: d.total_freight_revenue_etb,
      zarimaShareETB: d.zarima_share_etb,
      zarimaSharePercentage: d.zarima_share_percentage,
      partnerShareETB: d.partner_share_etb,
      partnerSharePercentage: d.partner_share_percentage,
      sharedArrangementNotes: d.shared_arrangement_notes,
    }))
    res.json(formatted)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

fleetRouter.post('/deliveries', (req, res) => {
  try {
    const {
      deliveryNoteNo,
      waybillNo,
      truckId,
      plateNumber,
      driverName,
      origin,
      destination,
      cargoType,
      cargoQuintals,
      departureTime,
      estimatedArrival,
      deliveryStatus = 'In Transit',
      freightChargeETB,
      businessActivity = 'Transport',
      isSharedTruckload = false,
      partnerCarrierName,
      partnerCargoQuintals,
      partnerRevenueShareETB,
    } = req.body

    const id = `DEL-${Date.now()}`

    db.prepare(`
      INSERT INTO deliveries (
        id, delivery_note_no, waybill_no, truck_id, plate_number, driver_name,
        origin, destination, cargo_type, cargo_quintals, departure_time,
        estimated_arrival, delivery_status, freight_charge_etb, business_activity,
        is_shared_truckload, partner_carrier_name, partner_cargo_quintals, partner_revenue_share_etb
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, deliveryNoteNo, waybillNo, truckId, plateNumber, driverName,
      origin, destination, cargoType, Number(cargoQuintals), departureTime,
      estimatedArrival, deliveryStatus, Number(freightChargeETB), businessActivity,
      isSharedTruckload ? 1 : 0, partnerCarrierName || null,
      partnerCargoQuintals ? Number(partnerCargoQuintals) : null,
      partnerRevenueShareETB ? Number(partnerRevenueShareETB) : null
    )

    const created = db.prepare('SELECT * FROM deliveries WHERE id = ?').get(id)
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/deliveries/:id/status — Manual dispatch status update
fleetRouter.patch('/deliveries/:id/status', (req, res) => {
  try {
    const { status } = req.body
    db.prepare('UPDATE deliveries SET delivery_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id)
    const updated = db.prepare('SELECT * FROM deliveries WHERE id = ?').get(req.params.id)
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/deliveries/:id/shared — Configure shared truckload co-loading
fleetRouter.patch('/deliveries/:id/shared', (req, res) => {
  try {
    const { isSharedTruckload, partnerCarrierName, partnerCargoQuintals, partnerRevenueShareETB } = req.body

    db.prepare(`
      UPDATE deliveries
      SET is_shared_truckload = ?,
          partner_carrier_name = ?,
          partner_cargo_quintals = ?,
          partner_revenue_share_etb = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      isSharedTruckload ? 1 : 0,
      partnerCarrierName || null,
      partnerCargoQuintals ? Number(partnerCargoQuintals) : null,
      partnerRevenueShareETB ? Number(partnerRevenueShareETB) : null,
      req.params.id
    )

    const updated = db.prepare('SELECT * FROM deliveries WHERE id = ?').get(req.params.id)
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// -------------------------------------------------------------
// MAINTENANCE & FUEL EXPENSES
// -------------------------------------------------------------
fleetRouter.get('/maintenance', (req, res) => {
  try {
    const records = db.prepare('SELECT * FROM maintenance_records ORDER BY date DESC').all()
    res.json(records)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

fleetRouter.post('/maintenance', (req, res) => {
  try {
    const { truckPlate, serviceType, date, workshopName, costETB, status = 'Completed', nextServiceDueKm, notes } = req.body
    const id = `MAINT-${Date.now()}`

    db.prepare(`
      INSERT INTO maintenance_records (id, truck_plate, service_type, date, workshop_name, cost_etb, status, next_service_due_km, notes, business_activity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Transport')
    `).run(id, truckPlate, serviceType, date, workshopName, Number(costETB), status, Number(nextServiceDueKm), notes)

    const created = db.prepare('SELECT * FROM maintenance_records WHERE id = ?').get(id)
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

fleetRouter.get('/fuel', (req, res) => {
  try {
    const expenses = db.prepare('SELECT * FROM fuel_expenses ORDER BY date DESC').all()
    res.json(expenses)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

fleetRouter.post('/fuel', (req, res) => {
  try {
    const { truckPlate, driverName, date, fuelLiters, pricePerLiterETB, totalCostETB, stationName, currentOdometerKm, receiptNo, isMemberFunded, memberExpenseId } = req.body
    const id = `FUEL-${Date.now()}`

    db.prepare(`
      INSERT INTO fuel_expenses (id, truck_plate, driver_name, date, fuel_liters, price_per_liter_etb, total_cost_etb, station_name, current_odometer_km, receipt_no, business_activity, is_member_funded, member_expense_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Transport', ?, ?)
    `).run(id, truckPlate, driverName, date, Number(fuelLiters), Number(pricePerLiterETB), Number(totalCostETB), stationName, Number(currentOdometerKm), receiptNo, isMemberFunded ? 1 : 0, memberExpenseId || null)

    const created = db.prepare('SELECT * FROM fuel_expenses WHERE id = ?').get(id)
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
