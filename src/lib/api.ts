/**
 * Zarima Trading ERP - Backend API Client
 * Connects frontend to the Node.js / SQLite backend
 */

const API_BASE = '/api'

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(errorBody.error || `HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

export const api = {
  // System Health
  health: () => request<{ status: string; database: string }>('/health'),

  // Member Expenses & Reimbursements
  getMembers: () => request<any[]>('/members'),
  getMemberExpenses: () => request<{ expenses: any[]; reimbursements: any[] }>('/member-expenses'),
  createMemberExpense: (data: any) =>
    request<any>('/member-expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  reimburseMemberExpense: (id: string, data: { amountETB: number; bankAccountId: string; bankReference: string }) =>
    request<any>(`/member-expenses/${id}/reimburse`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Banking & Treasury
  getBankAccounts: () => request<any[]>('/finance/bank-accounts'),
  getTransactions: () => request<any[]>('/finance/transactions'),
  createTransaction: (data: any) =>
    request<any>('/finance/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Bank Reconciliation
  getReconciliationStatements: () => request<any[]>('/finance/reconciliation/statements'),
  uploadStatement: (data: any) =>
    request<any>('/finance/reconciliation/statements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  lockStatement: (id: string) =>
    request<any>(`/finance/reconciliation/statements/${id}/lock`, {
      method: 'POST',
    }),
  matchExistingReconciliation: (data: { statementId: string; statementTxId: string; internalTxId: string }) =>
    request<any>('/finance/reconciliation/match-existing', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  postUnmatchedReconciliation: (data: {
    statementId: string
    statementTxId: string
    category: string
    businessActivity?: string
    notes?: string
  }) =>
    request<any>('/finance/reconciliation/post-unmatched', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Fleet & Transport
  getTrucks: () => request<any[]>('/fleet/trucks'),
  createTruck: (data: any) =>
    request<any>('/fleet/trucks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTruckStatus: (id: string, status: string) =>
    request<any>(`/fleet/trucks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  getDrivers: () => request<any[]>('/fleet/drivers'),
  createDriver: (data: any) =>
    request<any>('/fleet/drivers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getDeliveries: () => request<any[]>('/fleet/deliveries'),
  createDelivery: (data: any) =>
    request<any>('/fleet/deliveries', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateDeliveryStatus: (id: string, status: string) =>
    request<any>(`/fleet/deliveries/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  updateDeliveryShared: (id: string, data: any) =>
    request<any>(`/fleet/deliveries/${id}/shared`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  getMaintenance: () => request<any[]>('/fleet/maintenance'),
  getFuel: () => request<any[]>('/fleet/fuel'),

  // Cement Operations
  getInventory: () => request<any[]>('/cement/inventory'),
  getPurchases: () => request<any[]>('/cement/purchases'),
  createPurchase: (data: any) =>
    request<any>('/cement/purchases', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getSales: () => request<any[]>('/cement/sales'),
  createSale: (data: any) =>
    request<any>('/cement/sales', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getCustomers: () => request<any[]>('/cement/customers'),
  createCustomer: (data: any) =>
    request<any>('/cement/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getSuppliers: () => request<any[]>('/cement/suppliers'),

  // Financial Reports
  getPnL: (overheadAllocation: string = '60_40') =>
    request<any>(`/reports/pnl?overheadAllocation=${overheadAllocation}`),
  getTruckProfitability: () => request<any[]>('/reports/truck-profitability'),
}
