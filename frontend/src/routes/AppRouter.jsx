import { Routes, Route } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import DashboardPage from '../pages/DashboardPage'
import TicketsPage from '../pages/TicketsPage'

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="tickets" element={<TicketsPage />} />
      </Route>
    </Routes>
  )
}
