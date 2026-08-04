import { TicketX } from 'lucide-react'

const statusStyles = {
  Open: 'bg-green-100 text-green-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  Closed: 'bg-slate-100 text-slate-600',
}

const priorityStyles = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-yellow-100 text-yellow-800',
  Low: 'bg-blue-100 text-blue-700',
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status] ?? 'bg-slate-100 text-slate-600'}`}
    >
      {status}
    </span>
  )
}

function PriorityBadge({ priority }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityStyles[priority] ?? 'bg-slate-100 text-slate-600'}`}
    >
      {priority}
    </span>
  )
}

export function TicketTableSkeleton() {
  return (
    <div className="overflow-x-auto" aria-label="Loading tickets">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            {Array.from({ length: 7 }, (_, index) => (
              <th key={index} className="pb-3 pr-4">
                <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {Array.from({ length: 6 }, (_, index) => (
            <tr key={index}>
              {Array.from({ length: 7 }, (_, cellIndex) => (
                <td key={cellIndex} className="py-4 pr-4">
                  <div className={`h-4 animate-pulse rounded bg-slate-200 ${cellIndex === 2 ? 'w-40' : 'w-20'}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function TicketTable({ tickets = [], onViewTicket }) {
  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <TicketX className="h-7 w-7 text-slate-400" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-slate-500">No tickets found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="pb-3 pr-4 font-semibold text-slate-900">Ticket ID</th>
            <th className="pb-3 pr-4 font-semibold text-slate-900">Customer</th>
            <th className="pb-3 pr-4 font-semibold text-slate-900">Subject</th>
            <th className="pb-3 pr-4 font-semibold text-slate-900">Priority</th>
            <th className="pb-3 pr-4 font-semibold text-slate-900">Status</th>
            <th className="pb-3 pr-4 font-semibold text-slate-900">Updated</th>
            <th className="pb-3 font-semibold text-slate-900">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tickets.map((ticket) => (
            <tr key={ticket.ticket_id} className="text-slate-700">
              <td className="py-4 pr-4 font-medium text-slate-900">{ticket.ticket_id}</td>
              <td className="py-4 pr-4">{ticket.customer_name}</td>
              <td className="py-4 pr-4 max-w-xs truncate">{ticket.subject}</td>
              <td className="py-4 pr-4">
                <PriorityBadge priority={ticket.priority} />
              </td>
              <td className="py-4 pr-4">
                <StatusBadge status={ticket.status} />
              </td>
              <td className="py-4 pr-4 whitespace-nowrap text-slate-500">
                {ticket.updated_at
                  ? new Date(ticket.updated_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '—'}
              </td>
              <td className="py-4">
                <button
                  type="button"
                  onClick={() => onViewTicket?.(ticket.ticket_id)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
