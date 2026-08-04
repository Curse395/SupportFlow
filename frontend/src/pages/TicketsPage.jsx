import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { Plus, Search } from 'lucide-react'
import TicketDetailDrawer from '../components/tickets/TicketDetailDrawer'
import TicketTable, { TicketTableSkeleton } from '../components/tickets/TicketTable'
import CreateTicketModal from '../components/tickets/CreateTicketModal'
import useToast from '../hooks/useToast'

const PAGE_LIMIT = 10

export default function TicketsPage() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [selectedTicketId, setSelectedTicketId] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const { showToast } = useToast()
  const [searchParams] = useSearchParams()

  const fetchTickets = useCallback(async (searchValue = '', statusValue = 'All', pageValue = 1) => {
    setLoading(true)
    setError('')

    try {
      const params = { page: pageValue, limit: PAGE_LIMIT }

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
      showToast('We couldn’t load tickets. Please try again later.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter])

  useEffect(() => {
    // Open drawer if `open` query param present (from global search)
    const openId = searchParams.get('open')
    if (openId) {
      setSelectedTicketId(openId)
      setDrawerOpen(true)
    }

    const timeoutId = setTimeout(() => {
      fetchTickets(search, statusFilter, page)
    }, 400)

    return () => clearTimeout(timeoutId)
  }, [fetchTickets, page, search, statusFilter, searchParams])

  const handleViewTicket = (ticketId) => {
    setSelectedTicketId(ticketId)
    setDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setSelectedTicketId(null)
  }

  const handleTicketCreated = async () => {
    await fetchTickets(search, statusFilter, page)
  }

  const displayedTickets =
    priorityFilter === 'All'
      ? tickets
      : tickets.filter((ticket) => ticket.priority === priorityFilter)
  const hasActiveFilters = search || statusFilter !== 'All' || priorityFilter !== 'All'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Tickets</h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage customer support tickets
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
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
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 sm:w-auto"
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
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 sm:w-auto"
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
              setCreateModalOpen(true)
            }}
            className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 sm:w-auto"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create Ticket
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        {loading ? (
          <TicketTableSkeleton />
        ) : error ? (
          <p className="py-16 text-center text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        ) : (
          <>
            <TicketTable
              tickets={displayedTickets}
              onViewTicket={handleViewTicket}
              emptyTitle={hasActiveFilters ? 'No tickets match your filters' : 'No tickets found'}
              emptyDescription={hasActiveFilters ? 'Try adjusting your search or filter selection.' : 'Create a ticket to get started.'}
            />
            <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setPage((currentPage) => currentPage - 1)}
                disabled={page === 1}
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Previous
              </button>
              <p className="text-sm text-slate-500">Page {page}</p>
              <button
                type="button"
                onClick={() => setPage((currentPage) => currentPage + 1)}
                disabled={tickets.length < PAGE_LIMIT}
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Next
              </button>
            </div>
          </>
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
