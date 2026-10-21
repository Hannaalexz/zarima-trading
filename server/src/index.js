import express from 'express'
import cors from 'cors'
import { initDatabase } from './db.js'
import { seedDatabase } from './seed.js'
import { memberExpensesRouter } from './routes/memberExpenses.routes.js'
import { fleetRouter } from './routes/fleet.routes.js'
import { financeRouter } from './routes/finance.routes.js'
import { cementRouter } from './routes/cement.routes.js'
import { reportsRouter } from './routes/reports.routes.js'

const app = express()
const PORT = process.env.PORT || 5000

// Initialize and seed SQLite database
initDatabase()
seedDatabase()

// Middleware
app.use(cors())
app.use(express.json())

// Request logger
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`)
  next()
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'Zarima Trading ERP Backend',
    database: 'SQLite (Native Node.js 24 Engine)',
    timestamp: new Date().toISOString(),
  })
})

// Mount routers
app.use('/api', memberExpensesRouter)
app.use('/api/fleet', fleetRouter)
app.use('/api/finance', financeRouter)
app.use('/api/cement', cementRouter)
app.use('/api/reports', reportsRouter)

// Global error handler
app.use((err, req, res, next) => {
  console.error('[API Error]:', err)
  res.status(500).json({ error: err.message || 'Internal Server Error' })
})

app.listen(PORT, () => {
  console.log(`====================================================`)
  console.log(`🚀 Zarima Trading ERP Server running on http://localhost:${PORT}`)
  console.log(`📊 SQLite Database active at server/data/zarima.db`)
  console.log(`====================================================`)
})
