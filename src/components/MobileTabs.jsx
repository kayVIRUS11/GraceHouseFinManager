import { NavLink } from 'react-router-dom'
import { LayoutGrid, Users, Receipt, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../context/auth-context.js'

const tabClass = ({ isActive }) =>
  `flex flex-col items-center justify-center gap-0.5 text-[8px] uppercase tracking-[0.12em] transition-all duration-150 active:scale-90 hover:opacity-80 ${
    isActive ? 'text-[#1f1b17] font-semibold' : 'text-[#8b7c70] hover:text-[#1f1b17]'
  }`

function MobileTabs() {
  const { isAdmin, signOut } = useAuth()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      <div className="mx-auto max-w-[1240px] px-4">
        <div className="rounded-t-2xl border-x border-t border-[#e6ded4] bg-[#fefaf4]/95 px-3 py-2 shadow-[0_-4px_20px_-8px_rgba(31,27,23,0.15)] backdrop-blur-md">
          <div className={`grid items-center ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'}`}>
            <NavLink to="/" className={tabClass} end>
              <LayoutGrid size={18} />
              <span>Home</span>
            </NavLink>
            <NavLink to="/students" className={tabClass}>
              <Users size={18} />
              <span>Students</span>
            </NavLink>
            <NavLink to="/receipts" className={tabClass}>
              <Receipt size={18} />
              <span>Receipts</span>
            </NavLink>
            {isAdmin ? (
              <NavLink to="/admin" className={tabClass}>
                <Settings size={18} />
                <span>Admin</span>
              </NavLink>
            ) : null}
            <button onClick={signOut} className={tabClass({ isActive: false })}>
              <LogOut size={18} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default MobileTabs
