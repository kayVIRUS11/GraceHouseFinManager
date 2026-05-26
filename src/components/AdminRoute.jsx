import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/auth-context.js'

function AdminRoute({ children }) {
  const { loading, session, isAdmin } = useAuth()

  if (loading) {
    return (
      <div className="rounded-3xl border border-[#e6ded4] bg-white/80 p-5 text-sm text-[#7c6f63]">
        Checking admin access...
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/" replace />
  }

  if (!isAdmin) {
    return (
      <section className="rounded-3xl border border-[#f1d9b5] bg-[#fff5e4] p-6 text-sm text-[#7a4d0d]">
        Your account does not currently have admin privileges. Please contact the system administrator.
      </section>
    )
  }

  return children
}

export default AdminRoute
