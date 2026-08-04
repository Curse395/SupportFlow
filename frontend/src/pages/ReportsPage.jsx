import { useEffect, useState } from 'react'
import axios from 'axios'
import { Download, FileBarChart } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import DashboardCard from '../components/dashboard/DashboardCard'
import useToast from '../hooks/useToast'

function toChartData(data, labelKey) {
  if (Array.isArray(data)) {
    return data.map((item) => ({
      label: item[labelKey] ?? item.name ?? item.label,
      value: Number(item.count ?? item.value ?? item.tickets ?? 0),
    }))
  }

  return Object.entries(data ?? {}).map(([label, value]) => ({ label, value: Number(value) }))
}

function SummaryCard({ label, value }) {
  return (
    <DashboardCard>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
    </DashboardCard>
  )
}

export default function ReportsPage() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/reports/monthly-summary')
        setSummary(response.data)
      } catch {
        setError('We couldn’t load reports right now. Please try again later.')
        showToast('We couldn’t load reports right now. Please try again later.', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [showToast])

  const handleExport = async () => {
    setDownloading(true)

    try {
      const response = await axios.get('http://127.0.0.1:8000/api/reports/export/csv', {
        responseType: 'blob',
      })
      const url = URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }))
      const link = document.createElement('a')
      link.href = url
      link.download = 'tickets.csv'
      link.click()
      URL.revokeObjectURL(url)
      showToast('Ticket report exported successfully.')
    } catch {
      setError('We couldn’t export the ticket report. Please try again later.')
      showToast('We couldn’t export the ticket report. Please try again later.', 'error')
    } finally {
      setDownloading(false)
    }
  }

  const monthlyData = toChartData(summary?.tickets_by_month, 'month')
  const statusData = toChartData(summary?.status_distribution, 'status')
  const priorityData = toChartData(summary?.priority_distribution, 'priority')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Reports</h2>
          <p className="mt-1 text-sm text-slate-500">Review support performance and ticket trends</p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={downloading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          {downloading ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <DashboardCard key={index}>
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-9 w-16 animate-pulse rounded bg-slate-200" />
            </DashboardCard>
          ))}
        </div>
      ) : summary && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Total Tickets" value={summary.stats?.total_tickets ?? '-'} />
            <SummaryCard label="Open Tickets" value={summary.stats?.open ?? '-'} />
            <SummaryCard label="Closed Tickets" value={summary.stats?.closed ?? '-'} />
            <SummaryCard label="Avg. Resolution" value={summary.avg_resolution_hours ? `${summary.avg_resolution_hours} hrs` : '-'} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <DashboardCard title="Monthly Tickets">
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="value" name="Tickets" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </DashboardCard>

            <DashboardCard title="Ticket Distribution">
              <div className="space-y-5">
                {[['Status', statusData], ['Priority', priorityData]].map(([title, data]) => (
                  <div key={title}>
                    <p className="mb-2 text-sm font-medium text-slate-700">{title}</p>
                    <div className="space-y-2">
                      {data.map((item) => (
                        <div key={item.label} className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">{item.label}</span>
                          <span className="font-medium text-slate-900">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </div>
        </>
      )}

      {!loading && !summary && !error && (
        <DashboardCard>
          <div className="flex min-h-[240px] flex-col items-center justify-center text-center">
            <FileBarChart className="h-8 w-8 text-slate-400" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-slate-500">No report data is available yet.</p>
          </div>
        </DashboardCard>
      )}
    </div>
  )
}
