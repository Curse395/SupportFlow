import { useLocation } from 'react-router-dom'
import { Bell, Menu, Search } from 'lucide-react'

const pageTitles = {
  '/': 'Dashboard',
  '/tickets': 'Tickets',
}

export default function Navbar({ onMenuClick }) {
  const { pathname } = useLocation()
  const title = pageTitles[pathname] ?? 'SupportFlow'

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
            placeholder="Search..."
            aria-label="Search"
            className="h-10 w-48 rounded-lg border border-slate-200 bg-slate-50 pr-4 pl-9 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 lg:w-64"
          />
        </div>

        <button
          type="button"
          className="relative rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600" />
        </button>

        <div
          className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm ring-2 ring-white"
          role="img"
          aria-label="User avatar"
        />
      </div>
    </header>
  )
}
