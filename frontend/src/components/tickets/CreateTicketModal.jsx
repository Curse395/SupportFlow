import { useState } from 'react'
import axios from 'axios'
import { Loader2, X } from 'lucide-react'
import useToast from '../../hooks/useToast'

const initialForm = {
  customer_name: '',
  customer_email: '',
  subject: '',
  description: '',
  priority: 'Medium',
}

const inputClassName =
  'mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20'

export default function CreateTicketModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { showToast } = useToast()

  if (!open) return null

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  const handleClose = () => {
    if (submitting) return
    setError('')
    onClose()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await axios.post('http://127.0.0.1:8000/api/tickets/', form)
      await onCreated()
      setForm(initialForm)
      onClose()
      showToast('Ticket created successfully.')
    } catch {
      setError('Unable to create the ticket. Please try again.')
      showToast('Unable to create the ticket. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50"
        onClick={handleClose}
        aria-label="Close create ticket dialog"
      />

      <section
        className="relative z-10 w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-ticket-title"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 id="create-ticket-title" className="text-lg font-semibold text-slate-900">
            Create Ticket
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-5">
            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {error}
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Customer Name
                <input name="customer_name" value={form.customer_name} onChange={updateField} required className={inputClassName} />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Customer Email
                <input name="customer_email" type="email" value={form.customer_email} onChange={updateField} required className={inputClassName} />
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-700">
              Subject
              <input name="subject" value={form.subject} onChange={updateField} required className={inputClassName} />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Description
              <textarea name="description" value={form.description} onChange={updateField} required rows={4} className={inputClassName} />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Priority
              <select name="priority" value={form.priority} onChange={updateField} required className={inputClassName}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>
          </div>

          <footer className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <button type="button" onClick={handleClose} disabled={submitting} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {submitting ? 'Creating...' : 'Create Ticket'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}
