import { createContext, useContext, useState, ReactNode, useCallback } from 'react'

export interface Toast {
  id: string
  title: string
  description?: string
  type?: 'success' | 'info' | 'warning' | 'error'
}

interface ToastContextType {
  toasts: Toast[]
  toast: (options: { title: string; description?: string; type?: 'success' | 'info' | 'warning' | 'error' }) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(({ title, description, type = 'info' }: { title: string; description?: string; type?: 'success' | 'info' | 'warning' | 'error' }) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: Toast = { id, title, description, type }
    setToasts((prev) => [...prev, newToast])

    setTimeout(() => {
      dismiss(id)
    }, 4500)
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      {/* Toast container overlay */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-lg shadow-dropdown border transition-all transform animate-in slide-in-from-bottom-5 duration-200 flex justify-between items-start ${
              t.type === 'success'
                ? 'bg-surface border-status-success/30 text-foreground'
                : t.type === 'error'
                ? 'bg-surface border-status-danger/30 text-foreground'
                : t.type === 'warning'
                ? 'bg-surface border-status-warning/30 text-foreground'
                : 'bg-surface border-border text-foreground'
            }`}
          >
            <div>
              <div className="font-semibold text-sm flex items-center gap-2">
                {t.type === 'success' && <span className="w-2 h-2 rounded-full bg-status-success" />}
                {t.type === 'error' && <span className="w-2 h-2 rounded-full bg-status-danger" />}
                {t.type === 'warning' && <span className="w-2 h-2 rounded-full bg-status-warning" />}
                {t.type === 'info' && <span className="w-2 h-2 rounded-full bg-forest-light" />}
                {t.title}
              </div>
              {t.description && <p className="text-xs text-muted-foreground mt-1">{t.description}</p>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="text-muted-foreground hover:text-foreground text-xs p-1"
            >
              &times;
            </button>

          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
