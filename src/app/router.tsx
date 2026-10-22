import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { LandingPage } from '@/features/landing/LandingPage'
import { MainDashboard } from '@/features/dashboard/MainDashboard'
import { CementDashboard } from '@/features/cement/CementDashboard'
import { PurchasesPage } from '@/features/cement/PurchasesPage'
import { SalesPage } from '@/features/cement/SalesPage'
import { InventoryPage } from '@/features/cement/InventoryPage'
import { CustomersPage } from '@/features/cement/CustomersPage'
import { SuppliersPage } from '@/features/cement/SuppliersPage'
import { FleetDashboard } from '@/features/fleet/FleetDashboard'
import { TrucksPage } from '@/features/fleet/TrucksPage'
import { DeliveriesPage } from '@/features/fleet/DeliveriesPage'
import { DriversPage } from '@/features/fleet/DriversPage'
import { MaintenancePage } from '@/features/fleet/MaintenancePage'
import { ServicePage } from '@/features/fleet/ServicePage'
import { FuelExpensesPage } from '@/features/fleet/FuelExpensesPage'
import { FinanceDashboard } from '@/features/finance/FinanceDashboard'
import { BankAccountsPage } from '@/features/finance/BankAccountsPage'
import { TransactionsPage } from '@/features/finance/TransactionsPage'
import { ReconciliationPage } from '@/features/finance/ReconciliationPage'
import { MemberExpensesPage } from '@/features/finance/MemberExpensesPage'
import { PayrollPage } from '@/features/finance/PayrollPage'
import { ReceivablesPage } from '@/features/finance/ReceivablesPage'
import { PayablesPage } from '@/features/finance/PayablesPage'
import { ReportsPage } from '@/features/finance/ReportsPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { ConfigurationPage } from '@/features/configuration/ConfigurationPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <MainDashboard />,
      },
      // Cement Trading Routes
      {
        path: 'cement',
        element: <CementDashboard />,
      },
      {
        path: 'cement/purchases',
        element: <PurchasesPage />,
      },
      {
        path: 'cement/sales',
        element: <SalesPage />,
      },
      {
        path: 'cement/inventory',
        element: <InventoryPage />,
      },
      {
        path: 'cement/customers',
        element: <CustomersPage />,
      },
      {
        path: 'cement/suppliers',
        element: <SuppliersPage />,
      },
      // Transport & Fleet Routes
      {
        path: 'fleet',
        element: <FleetDashboard />,
      },
      {
        path: 'fleet/trucks',
        element: <TrucksPage />,
      },
      {
        path: 'fleet/deliveries',
        element: <DeliveriesPage />,
      },
      {
        path: 'fleet/drivers',
        element: <DriversPage />,
      },
      {
        path: 'fleet/service',
        element: <ServicePage />,
      },
      {
        path: 'fleet/maintenance',
        element: <MaintenancePage />,
      },
      {
        path: 'fleet/fuel',
        element: <FuelExpensesPage />,
      },
      {
        path: 'fleet/gps',
        element: <Navigate to="/fleet/deliveries" replace />,
      },
      // Finance & Accounting Routes
      {
        path: 'finance',
        element: <FinanceDashboard />,
      },
      {
        path: 'finance/banks',
        element: <BankAccountsPage />,
      },
      {
        path: 'finance/transactions',
        element: <TransactionsPage />,
      },
      {
        path: 'finance/reconciliation',
        element: <ReconciliationPage />,
      },
      {
        path: 'finance/member-expenses',
        element: <MemberExpensesPage />,
      },
      {
        path: 'finance/payroll',
        element: <PayrollPage />,
      },
      {
        path: 'finance/receivables',
        element: <ReceivablesPage />,
      },
      {
        path: 'finance/payables',
        element: <PayablesPage />,
      },
      {
        path: 'finance/reports',
        element: <ReportsPage />,
      },
      // Master Data & Configuration
      {
        path: 'configuration',
        element: <ConfigurationPage />,
      },
      // System Settings
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: '*',
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
])
