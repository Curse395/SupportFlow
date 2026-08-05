import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, Menu, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import axios from 'axios'

const pageTitles = {
  '/': 'Dashboard',
  '/tickets': 'Tickets',
  '/reports': 'Reports',
}

export default function Navbar({ onMenuClick }) {
  const { pathname } = useLocation()
  const title = pageTitles[pathname] ?? 'SupportFlow'
  const navigate = useNavigate()

  // Profile menu state and ref
  const { open, setOpen, menuRef } = useProfileMenuState()

  // Notification menu state (reuse same hook shape)
  const { open: notifOpen, setOpen: setNotifOpen, menuRef: notifRef } = useProfileMenuState()

  // Demo notifications (local only)
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Ticket #123 assigned to you', time: '2h ago', unread: true },
    { id: 2, title: 'Customer replied on Ticket #117', time: '4h ago', unread: true },
    { id: 3, title: 'Ticket #99 resolved', time: '1d ago', unread: false },
  ])

  const unreadCount = notifications.filter(n => n.unread).length

  function markAsRead(id) {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, unread: false } : n)))
  }

  function markAllAsRead() {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
  }

  // Global ticket search: query + suggestions
  const [ticketQuery, setTicketQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [suggestionsVisible, setSuggestionsVisible] = useState(false)

  useEffect(() => {
    if (!ticketQuery) {
      setSuggestions([])
      setSuggestionsVisible(false)
      return
    }

    const id = setTimeout(async () => {
      try {
        const res = await axios.get('/api/tickets/', { params: { search: ticketQuery, limit: 5 } })
        const data = Array.isArray(res.data) ? res.data : res.data.results ?? []
        setSuggestions(data)
        setSuggestionsVisible(true)
      } catch {
        setSuggestions([])
        setSuggestionsVisible(true)
      }
    }, 300)

    return () => clearTimeout(id)
  }, [ticketQuery])

  // User info (mock) and logout
  const userName = typeof window !== 'undefined' ? window.localStorage.getItem('userName') || 'Admin' : 'Admin'
  const userRole = typeof window !== 'undefined' ? window.localStorage.getItem('userRole') || 'Support Manager' : 'Support Manager'

  function handleLogout() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('userName')
      window.localStorage.removeItem('userRole')
    }
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-[70px] shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="truncate text-lg font-semibold text-slate-900 sm:text-xl">
          {title}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <div className="relative hidden sm:block">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search tickets..."
            aria-label="Search tickets"
            value={ticketQuery}
            onChange={(e) => setTicketQuery(e.target.value)}
            className="h-10 w-48 rounded-lg border border-slate-200 bg-slate-50 pr-4 pl-9 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 lg:w-64"
          />

          {ticketQuery && suggestionsVisible && (
            <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
              <div className="max-h-60 overflow-y-auto">
                {suggestions.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-slate-600">No results</div>
                ) : (
                  suggestions.map((t) => (
                    <button
                      key={t.ticket_id}
                      onClick={() => {
                        setTicketQuery('')
                        setSuggestionsVisible(false)
                        navigate(`/tickets?open=${encodeURIComponent(t.ticket_id)}`)
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50"
                    >
                      <div className="text-sm font-medium text-slate-900">{t.ticket_id} — {t.subject}</div>
                      <div className="mt-1 text-xs text-slate-500">{t.customer_name} · {t.customer_email}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen(prev => !prev)}
            className="relative rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
            aria-label="Notifications"
            aria-haspopup="true"
            aria-expanded={notifOpen}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 ? (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-medium text-white">
                {unreadCount}
              </span>
            ) : (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600" />
            )}
          </button>

          {notifOpen && (
            <div
              ref={notifRef}
              className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 bg-white py-2 shadow-lg"
              role="menu"
            >
              <div className="flex items-center justify-between px-4 pb-2">
                <div className="text-sm font-semibold text-slate-900">Notifications</div>
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-slate-500 hover:underline"
                >
                  Mark all read
                </button>
              </div>

              <div className="max-h-56 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-slate-600">No notifications</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 hover:bg-slate-50 ${n.unread ? 'bg-slate-50' : ''} flex items-start justify-between gap-3`}
                    >
                      <div className="min-w-0">
                        <div className={`text-sm ${n.unread ? 'font-semibold text-slate-900' : 'text-slate-800'}`}>
                          {n.title}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">{n.time}</div>
                      </div>
                      <div className="shrink-0">
                        {n.unread ? (
                          <button
                            onClick={() => markAsRead(n.id)}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Mark read
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen(prev => !prev)}
            className="flex items-center"
            aria-haspopup="true"
            aria-expanded={open}
          >
            <div
              className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm ring-2 ring-white"
              role="img"
              aria-label="User avatar"
            />
          </button>

          {open && (
            <div
              className="absolute right-0 mt-2 w-44 rounded-lg border border-slate-200 bg-white py-2 shadow-lg"
              role="menu"
            >
              <div className="px-4 py-2">
                <div className="text-sm font-medium text-slate-900">{userName}</div>
                <div className="text-xs text-slate-500">{userRole}</div>
              </div>
              <div className="mt-2 border-t border-slate-100" />
              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                role="menuitem"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function useProfileMenuState() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleDocClick)
    }

    return () => {
      document.removeEventListener('mousedown', handleDocClick)
    }
  }, [open])

  return { open, setOpen, menuRef }
}