import { BrowserRouter } from 'react-router-dom'
import AppRouter from './routes/AppRouter'
import { ToastProvider } from './components/ui/ToastProvider'
import { AuthProvider } from './auth/AuthContext'

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
