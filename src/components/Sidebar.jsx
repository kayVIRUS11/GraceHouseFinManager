import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutGrid, Users, Settings, Lock, Receipt } from 'lucide-react'
import { useSchool } from '../context/SchoolContext.jsx'
import AdminPinModal from './AdminPinModal.jsx'

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
    isActive
      ? 'bg-[#1f1b17] text-[#fef7ed] shadow-[0_10px_20px_-12px_rgba(31,27,23,0.8)]'
      : 'text-[#4d443b] hover:bg-[#efe6da]'
  }`

function Sidebar({ onClose, showClose = false }) {
  const { adminUnlocked, verifyAdminPin, lockAdmin } = useSchool()
  const [isPinOpen, setIsPinOpen] = useState(false)
  const navigate = useNavigate()

  const handleUnlock = (pin) => {
    const ok = verifyAdminPin(pin)
    if (ok) {
      navigate('/admin')
    }
    return ok
  }

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
          <p className="mt-1 text-sm font-semibold text-[#1f1b17]">2026 Term 1</p>
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
          {adminUnlocked ? (
            <NavLink to="/admin" className={navLinkClass}>
              <Settings size={18} />
              Admin
            </NavLink>
          ) : (
            <button
              type="button"
              onClick={() => setIsPinOpen(true)}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[#4d443b] transition hover:bg-[#efe6da]"
            >
              <Lock size={18} />
              Admin
            </button>
          )}
        </nav>
        {adminUnlocked ? (
          <button
            type="button"
            onClick={lockAdmin}
            className="rounded-full border border-[#e5ddd2] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#7c6f63]"
          >
            Lock admin
          </button>
        ) : null}
        <div className="rounded-2xl border border-dashed border-[#e5ddd2] px-4 py-4">
          <p className="text-xs text-[#8b7c70]">Next payout reminder</p>
          <p className="mt-2 text-sm font-semibold text-[#1f1b17]">
            Generate receipts by June 10
          </p>
        </div>
      </div>
      <AdminPinModal
        isOpen={isPinOpen}
        onClose={() => setIsPinOpen(false)}
        onVerify={handleUnlock}
      />
    </aside>
  )
}

export default Sidebar
