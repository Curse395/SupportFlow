import { useCallback, useState } from 'react'
import { CheckCircle2, CircleAlert, X } from 'lucide-react'
import ToastContext from './toastContext'

const toastStyles = {
  success: 'border-green-200 bg-green-50 text-green-700',
  error: 'border-red-200 bg-red-50 text-red-700',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismissToast = useCallback((id) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((message, type = 'success') => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((currentToasts) => [...currentToasts, { id, message, type }])
    window.setTimeout(() => dismissToast(id), 5000)
  }, [dismissToast])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => {
          const Icon = toast.type === 'success' ? CheckCircle2 : CircleAlert

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg ${toastStyles[toast.type] ?? toastStyles.success}`}
              role={toast.type === 'error' ? 'alert' : 'status'}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p className="flex-1">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="-mr-1 rounded p-1 transition-colors hover:bg-black/5"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
