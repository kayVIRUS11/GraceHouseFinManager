import { NavLink } from 'react-router-dom'
import { LayoutGrid, Users, Receipt, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../context/auth-context.js'

const tabClass = ({ isActive }) =>
  `flex flex-col items-center gap-1 text-[10px] uppercase tracking-[0.2em] ${
    isActive ? 'text-[#1f1b17]' : 'text-[#8b7c70]'
  }`

function MobileTabs() {
  const { isAdmin, signOut } = useAuth()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#e6ded4] bg-[#fefaf4] px-4 py-3 md:hidden">
      <div className={`grid items-center ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'}`}>
        <NavLink to="/" className={tabClass} end>
          <LayoutGrid size={18} />
          Home
        </NavLink>
        <NavLink to="/students" className={tabClass}>
          <Users size={18} />
          Students
        </NavLink>
        <NavLink to="/receipts" className={tabClass}>
          <Receipt size={18} />
          Receipts
        </NavLink>
        {isAdmin ? (
          <NavLink to="/admin" className={tabClass}>
            <Settings size={18} />
            Admin
          </NavLink>
        ) : null}
        <button onClick={signOut} className={tabClass({ isActive: false })}>
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </nav>
  )
}

export default MobileTabs
