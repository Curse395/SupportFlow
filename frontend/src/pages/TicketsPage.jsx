import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { Plus, Search } from 'lucide-react'
import TicketDetailDrawer from '../components/tickets/TicketDetailDrawer'
import TicketTable from '../components/tickets/TicketTable'
import CreateTicketModal from '../components/tickets/CreateTicketModal'

export default function TicketsPage() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [selectedTicketId, setSelectedTicketId] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const fetchTickets = useCallback(async (searchValue = '', statusValue = 'All') => {
    setLoading(true)
    setError('')

    try {
      const params = {}

      if (searchValue.trim()) {
        params.search = searchValue.trim()
      }

      if (statusValue !== 'All') {
        params.status = statusValue
      }

      const response = await axios.get('http://127.0.0.1:8000/api/tickets/', { params })
      setTickets(response.data)
    } catch {
      setTickets([])
      setError('We couldn’t load tickets. Please try again later.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTickets(search, statusFilter)
    }, 400)

    return () => clearTimeout(timeoutId)
  }, [fetchTickets, search, statusFilter])

  const handleViewTicket = (ticketId) => {
    setSelectedTicketId(ticketId)
    setDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setSelectedTicketId(null)
  }

  const handleTicketCreated = async () => {
    await fetchTickets(search, statusFilter)
    setSuccessMessage('Ticket created successfully.')
  }

  const displayedTickets =
    priorityFilter === 'All'
      ? tickets
      : tickets.filter((ticket) => ticket.priority === priorityFilter)

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
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pr-4 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              <option value="All">All</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>

            <select
              aria-label="Filter by priority"
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
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
            onClick={() => {
              setSuccessMessage('')
              setCreateModalOpen(true)
            }}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create Ticket
          </button>
        </div>
      </div>

      {successMessage && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700" role="status">
          {successMessage}
        </p>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <p className="py-16 text-center text-sm font-medium text-slate-500">
            Loading...
          </p>
        ) : error ? (
          <p className="py-16 text-center text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        ) : (
          <TicketTable tickets={displayedTickets} onViewTicket={handleViewTicket} />
        )}
      </div>

      <TicketDetailDrawer
        ticketId={selectedTicketId}
        open={drawerOpen}
        onClose={handleCloseDrawer}
      />

      <CreateTicketModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleTicketCreated}
      />
    </div>
  )
}
