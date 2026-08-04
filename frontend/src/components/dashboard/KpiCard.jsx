import DashboardCard from './DashboardCard'

const accents = {
  blue: {
    bar: 'bg-blue-600',
    icon: 'bg-blue-50 text-blue-600',
  },
  amber: {
    bar: 'bg-amber-500',
    icon: 'bg-amber-50 text-amber-600',
  },
  violet: {
    bar: 'bg-violet-500',
    icon: 'bg-violet-50 text-violet-600',
  },
  emerald: {
    bar: 'bg-emerald-500',
    icon: 'bg-emerald-50 text-emerald-600',
  },
}

export default function KpiCard({ icon: Icon, title, value, accent = 'blue' }) {
  const { bar, icon } = accents[accent] ?? accents.blue

  return (
    <DashboardCard className="relative overflow-hidden pt-7">
      <div className={`absolute top-0 right-0 left-0 h-1 ${bar}`} aria-hidden="true" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${icon}`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </DashboardCard>
  )
}
