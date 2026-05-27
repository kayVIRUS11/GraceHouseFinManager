import { NavLink } from 'react-router-dom'
import { LayoutGrid, Users, Settings, Receipt } from 'lucide-react'
import { useSchool } from '../context/school-context.js'
import { useAuth } from '../context/auth-context.js'

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
    isActive
      ? 'bg-[#1f1b17] text-[#fef7ed] shadow-[0_10px_20px_-12px_rgba(31,27,23,0.8)]'
      : 'text-[#4d443b] hover:bg-[#efe6da]'
  }`

function Sidebar({ onClose, showClose = false }) {
  const { termInfo } = useSchool()
  const { isAdmin, role } = useAuth()

  return (
    <aside className="h-full w-full shrink-0 rounded-[28px] border border-[#e5ddd2] bg-[#fefaf4] p-6 shadow-[0_18px_45px_-35px_rgba(31,27,23,0.55)]">
      <div className="flex flex-col gap-6">
        {showClose ? (
          <div className="flex justify-end md:hidden">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#e5ddd2] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#7c6f63]"
            >
              Close
            </button>
          </div>
        ) : null}
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#9c8f83]">
            Grace House
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-[#1f1b17]">
            Bursar Desk
          </h1>
        </div>
        <div className="rounded-2xl border border-[#eadfd3] bg-[#f4eadf] px-4 py-3">
          <p className="text-xs text-[#7c6f63]">Current term</p>
          <p className="mt-1 text-sm font-semibold text-[#1f1b17]">
            {termInfo.session} · {termInfo.term}
          </p>
        </div>
        <nav className="flex flex-col gap-2">
          <NavLink to="/" className={navLinkClass} end>
            <LayoutGrid size={18} />
            Dashboard
          </NavLink>
          <NavLink to="/students" className={navLinkClass}>
            <Users size={18} />
            Students
          </NavLink>
          <NavLink to="/receipts" className={navLinkClass}>
            <Receipt size={18} />
            Pending receipts
          </NavLink>
          {isAdmin ? (
            <NavLink to="/admin" className={navLinkClass}>
              <Settings size={18} />
              Admin
            </NavLink>
          ) : null}
        </nav>
        <div className="rounded-2xl border border-[#efe6da] bg-white px-4 py-3 text-xs text-[#7c6f63]">
          Signed in role: <span className="font-semibold text-[#1f1b17]">{role}</span>
        </div>
        <div className="rounded-2xl border border-dashed border-[#e5ddd2] px-4 py-4">
          <p className="text-xs text-[#8b7c70]">Next payout reminder</p>
          <p className="mt-2 text-sm font-semibold text-[#1f1b17]">
            Generate receipts by June 10
          </p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
