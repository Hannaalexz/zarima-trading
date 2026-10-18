import React, { ReactNode } from 'react'
import { ThemeProvider } from '@/hooks/useTheme'
import { ToastProvider } from '@/hooks/useToast'
import { StoreProvider } from '@/data/storeContext'

export const AppProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <StoreProvider>
          {children}
        </StoreProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
