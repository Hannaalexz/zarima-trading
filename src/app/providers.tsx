import React, { ReactNode } from 'react'
import { ThemeProvider } from '@/hooks/useTheme'
import { ToastProvider } from '@/hooks/useToast'
import { StoreProvider } from '@/data/storeContext'
import { AuthProvider } from '@/data/authContext'

export const AppProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <StoreProvider>
            {children}
          </StoreProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
