import { Plus, Search } from 'lucide-react'
import TicketTable from '../components/tickets/TicketTable'

const SAMPLE_TICKETS = [
  {
    id: 'TKT-1001',
    customer: 'Sarah Johnson',
    subject: 'Unable to reset password',
    priority: 'High',
    status: 'Open',
    updated: 'Aug 4, 2026',
  },
  {
    id: 'TKT-1002',
    customer: 'Michael Chen',
    subject: 'Billing inquiry for last invoice',
    priority: 'Medium',
    status: 'In Progress',
    updated: 'Aug 3, 2026',
  },
  {
    id: 'TKT-1003',
    customer: 'Emily Davis',
    subject: 'Feature request: export reports',
    priority: 'Low',
    status: 'Closed',
    updated: 'Aug 1, 2026',
  },
]

export default function TicketsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Tickets</h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage customer support tickets
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search tickets..."
                aria-label="Search tickets"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pr-4 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <select
              aria-label="Filter by status"
              defaultValue="All"
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              <option value="All">All</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>

            <select
              aria-label="Filter by priority"
              defaultValue="All"
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              <option value="All">All</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <button
            type="button"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create Ticket
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <TicketTable tickets={SAMPLE_TICKETS} />
      </div>
    </div>
  )
}
