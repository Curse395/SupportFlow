import { CheckCircle2, CircleDot, Clock, Ticket } from 'lucide-react'
import DashboardCard from '../components/dashboard/DashboardCard'
import KpiCard from '../components/dashboard/KpiCard'

const kpiMetrics = [
  {
    title: 'Total Tickets',
    value: '—',
    icon: Ticket,
    accent: 'blue',
  },
  {
    title: 'Open',
    value: '—',
    icon: CircleDot,
    accent: 'amber',
  },
  {
    title: 'In Progress',
    value: '—',
    icon: Clock,
    accent: 'violet',
  },
  {
    title: 'Closed',
    value: '—',
    icon: CheckCircle2,
    accent: 'emerald',
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiMetrics.map((metric) => (
          <KpiCard key={metric.title} {...metric} />
        ))}
      </div>

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
