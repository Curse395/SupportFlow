import { useEffect, useState } from 'react'
import axios from 'axios'
import { CheckCircle2, CircleDot, Clock, Ticket } from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import DashboardCard from '../components/dashboard/DashboardCard'
import KpiCard from '../components/dashboard/KpiCard'
import useToast from '../hooks/useToast'

const kpiMetrics = [
  { title: 'Total Tickets', key: 'total_tickets', icon: Ticket, accent: 'blue' },
  { title: 'Open Tickets', key: 'open', icon: CircleDot, accent: 'amber' },
  { title: 'In Progress Tickets', key: 'in_progress', icon: Clock, accent: 'violet' },
  { title: 'Closed Tickets', key: 'closed', icon: CheckCircle2, accent: 'emerald' },
]

const chartColors = ['#2563eb', '#f59e0b', '#10b981']

function ChartSkeleton() {
  return (
    <div className="flex h-[240px] items-end gap-3 px-4 pb-5" aria-label="Loading chart">
      {[45, 75, 55, 90, 65, 40, 70].map((height, index) => (
        <div
          key={index}
          className="flex-1 animate-pulse rounded-t bg-slate-200"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  )
}

function getDailyTicketData(tickets) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - (6 - index))
    return date
  })

  return days.map((date) => {
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)

    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      tickets: tickets.filter((ticket) => {
        const createdAt = new Date(ticket.created_at)
        return createdAt >= date && createdAt < nextDate
      }).length,
    }
  })
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsResponse, ticketsResponse] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/dashboard/stats'),
          axios.get('http://127.0.0.1:8000/api/tickets/', { params: { limit: 100 } }),
        ])
        setStats(statsResponse.data)
        setTickets(ticketsResponse.data)
      } catch {
        setError(true)
        showToast('We couldn’t load dashboard statistics. Please try again later.', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [showToast])

  const statusData = [
    { name: 'Open', value: stats?.open ?? 0 },
    { name: 'In Progress', value: stats?.in_progress ?? 0 },
    { name: 'Closed', value: stats?.closed ?? 0 },
  ]
  const priorityData = ['Low', 'Medium', 'High'].map((priority) => ({
    name: priority,
    value: tickets.filter((ticket) => ticket.priority === priority).length,
  }))
  const dailyTicketData = getDailyTicketData(tickets)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiMetrics.map((metric) => (
          <KpiCard
            key={metric.title}
            {...metric}
            value={stats?.[metric.key] ?? '-'}
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
        <DashboardCard title="Tickets by Status">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={3}>
                    {statusData.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </DashboardCard>

        <DashboardCard title="Tickets by Priority">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={priorityData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={3}>
                    {priorityData.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </DashboardCard>
      </div>

      <DashboardCard title="Daily Tickets">
        {loading ? (
          <ChartSkeleton />
        ) : (
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyTicketData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="tickets" name="Tickets" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </DashboardCard>
    </div>
  )
}
