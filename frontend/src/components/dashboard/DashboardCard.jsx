export default function DashboardCard({ title, children, className = '' }) {
  return (
    <section
      className={`rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm ${className}`}
    >
      {title && (
        <h3 className="mb-4 text-base font-semibold text-slate-900">{title}</h3>
      )}
      {children}
    </section>
  )
}
