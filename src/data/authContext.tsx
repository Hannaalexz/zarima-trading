import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type UserRole = 'admin' | 'accountant'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  roleTitle: string
  avatarInitials: string
  department: string
  badgeColor: string
  responsibilities: string[]
  canManageFleet: boolean
  canCutInvoices: boolean
  canReconcileBanks: boolean
  canApproveReimbursements: boolean
  canManageSettings: boolean
}

export const PRESET_USERS: Record<UserRole, User> = {
  accountant: {
    id: 'USR-ACCT-01',
    name: 'Bethlehem Tefera',
    email: 'accountant@zarima-trading.et',
    role: 'accountant',
    roleTitle: 'Senior Accountant & Treasury Officer',
    avatarInitials: 'BT',
    department: 'Accounting & Invoicing Desk',
    badgeColor: '#22C55E',
    responsibilities: [
      'Cuts Purchases Invoices when physical cement is delivered to depot',
      'Cuts Sales Invoices to Usual and New registered customers',
      'Performs 10-Bank Statement Reconciliations and Journal postings',
      'Monitors customer receivables, credit limits, and payment receipts',
      'Processes factory payables and operational vouchers',
    ],
    canManageFleet: false,
    canCutInvoices: true,
    canReconcileBanks: true,
    canApproveReimbursements: false,
    canManageSettings: false,
  },
  admin: {
    id: 'USR-ADM-01',
    name: 'Dawit Tadesse',
    email: 'admin@zarima-trading.et',
    role: 'admin',
    roleTitle: 'Managing Partner & Systems Administrator',
    avatarInitials: 'DT',
    department: 'Executive Operations & Governance',
    badgeColor: '#FF6B00',
    responsibilities: [
      'Master Administrative control over all system modules',
      'Approves & Disburses Member-Funded Expense Reimbursements',
      'Full Fleet dispatch, route management & truckload allocations',
      'Direct oversight of all 10 Bank Accounts and Master P&L',
      'Configures corporate overhead ratios, tax, and system preferences',
    ],
    canManageFleet: true,
    canCutInvoices: true,
    canReconcileBanks: true,
    canApproveReimbursements: true,
    canManageSettings: true,
  },
}

interface AuthContextType {
  currentUser: User | null
  isAuthenticated: boolean
  login: (email: string, password?: string) => { success: boolean; error?: string }
  loginAs: (role: UserRole) => void
  switchRole: (role: UserRole) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'zarima_auth_user'

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.role && PRESET_USERS[parsed.role as UserRole]) {
          return PRESET_USERS[parsed.role as UserRole]
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored auth user', e)
    }
    // Default to unauthenticated so visitors must sign in via Staff Portal (/login)
    return null
  })

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch (e) {
      console.warn('Failed to persist auth state', e)
    }
  }, [currentUser])

  const loginAs = (role: UserRole) => {
    const user = PRESET_USERS[role]
    setCurrentUser(user)
  }

  const switchRole = (role: UserRole) => {
    loginAs(role)
  }

  const login = (email: string, _password?: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase()
    if (cleanEmail === PRESET_USERS.accountant.email || cleanEmail === 'accountant' || cleanEmail.includes('account')) {
      setCurrentUser(PRESET_USERS.accountant)
      return { success: true }
    }
    if (cleanEmail === PRESET_USERS.admin.email || cleanEmail === 'admin' || cleanEmail.includes('admin')) {
      setCurrentUser(PRESET_USERS.admin)
      return { success: true }
    }

    return {
      success: false,
      error: 'Unrecognized credentials. Use admin@zarima-trading.et or accountant@zarima-trading.et, or select 1-click login.',
    }
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        loginAs,
        switchRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
