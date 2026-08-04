import { useEffect, useState } from 'react'
import axios from 'axios'
import { CheckCircle2, CircleDot, Clock, Ticket } from 'lucide-react'
import DashboardCard from '../components/dashboard/DashboardCard'
import KpiCard from '../components/dashboard/KpiCard'

const kpiMetrics = [
  { title: 'Total Tickets', key: 'total_tickets', icon: Ticket, accent: 'blue' },
  { title: 'Open Tickets', key: 'open', icon: CircleDot, accent: 'amber' },
  { title: 'In Progress Tickets', key: 'in_progress', icon: Clock, accent: 'violet' },
  { title: 'Closed Tickets', key: 'closed', icon: CheckCircle2, accent: 'emerald' },
]

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/dashboard/stats')
        setStats(response.data)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiMetrics.map((metric) => (
          <KpiCard
            key={metric.title}
            {...metric}
            value={stats?.[metric.key]}
            loading={loading}
          />
        ))}
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
          We couldn’t load dashboard statistics. Please try again later.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DashboardCard title="Recent Activity">
          <div className="flex min-h-[240px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50">
            <p className="text-sm font-medium text-slate-400">
              Activity Timeline Coming Soon
            </p>
          </div>
        </DashboardCard>

        <DashboardCard title="Support Analytics">
          <div className="flex min-h-[240px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50">
            <p className="text-sm font-medium text-slate-400">
              Charts Coming Soon
            </p>
          </div>
        </DashboardCard>
      </div>
    </div>
  )
}
