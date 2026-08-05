import { useEffect, useState } from 'react'
import axios from 'axios'
import { Loader2, X } from 'lucide-react'

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

function formatDateTime(value) {
  if (!value) return '—'

  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function DetailField({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-slate-900">{children}</dd>
    </div>
  )
}

export default function TicketDetailDrawer({ ticketId, open, onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [details, setDetails] = useState(null)

  useEffect(() => {
    if (!open || !ticketId) {
      return
    }

    const fetchTicketDetails = async () => {
      setLoading(true)
      setError(null)
      setDetails(null)

      try {
        const response = await axios.get(
          `/api/tickets/${ticketId}`,
        )
        setDetails(response.data)
      } catch {
        setError('Unable to load ticket details.')
      } finally {
        setLoading(false)
      }
    }

    fetchTicketDetails()
  }, [open, ticketId])

  if (!open) {
    return null
  }

  const ticket = details?.ticket
  const notes = [...(details?.notes ?? [])].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at),
  )

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-slate-900/50"
        onClick={onClose}
        aria-label="Close ticket details"
      />

      <aside
        className="fixed top-0 right-0 z-50 flex h-full w-full max-w-[520px] flex-col border-l border-slate-200 bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ticket-detail-title"
      >
        <header className="flex h-[70px] shrink-0 items-center justify-between border-b border-slate-200 px-6">
          <div className="min-w-0 flex-1 pr-4">
            <h2 id="ticket-detail-title" className="truncate text-lg font-semibold text-slate-900">
              {ticket?.subject ?? 'Ticket Details'}
            </h2>
            <p className="mt-0.5 truncate text-sm text-slate-500">
              {ticket?.ticket_id ?? ticketId}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Loading...
            </div>
          )}

          {error && (
            <p className="py-16 text-center text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          {!loading && !error && ticket && (
            <div className="space-y-8">
              <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <DetailField label="Ticket ID">{ticket.ticket_id}</DetailField>
                <DetailField label="Customer Name">{ticket.customer_name}</DetailField>
                <DetailField label="Customer Email">{ticket.customer_email}</DetailField>
                <DetailField label="Subject">{ticket.subject}</DetailField>
                <DetailField label="Status">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[ticket.status] ?? 'bg-slate-100 text-slate-600'}`}
                  >
                    {ticket.status}
                  </span>
                </DetailField>
                <DetailField label="Priority">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityStyles[ticket.priority] ?? 'bg-slate-100 text-slate-600'}`}
                  >
                    {ticket.priority}
                  </span>
                </DetailField>
                <DetailField label="Created At">
                  {formatDateTime(ticket.created_at)}
                </DetailField>
                <DetailField label="Updated At">
                  {formatDateTime(ticket.updated_at)}
                </DetailField>
              </dl>

              <div>
                <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Description
                </h3>
                <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                  {ticket.description}
                </p>
              </div>

              <div>
                <h3 className="mb-4 text-base font-semibold text-slate-900">Notes</h3>
                {notes.length === 0 ? (
                  <p className="text-sm text-slate-500">No notes yet.</p>
                ) : (
                  <div>
                    {notes.map((note, index) => {
                      const isLast = index === notes.length - 1

                      return (
                        <div
                          key={note.id}
                          className={`flex gap-3 ${isLast ? '' : 'pb-6'}`}
                        >
                          <div className="flex flex-col items-center self-stretch">
                            <span
                              className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600"
                              aria-hidden="true"
                            />
                            {!isLast && (
                              <span
                                className="mt-1 w-px flex-1 bg-slate-200"
                                aria-hidden="true"
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-slate-700">{note.note_text}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {formatDateTime(note.created_at)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
