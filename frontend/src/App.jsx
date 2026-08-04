import { BrowserRouter } from 'react-router-dom'
import AppRouter from './routes/AppRouter'
import { ToastProvider } from './components/ui/ToastProvider'

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
