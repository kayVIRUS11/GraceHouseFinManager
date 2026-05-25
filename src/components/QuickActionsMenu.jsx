import { useEffect, useRef, useState } from 'react'
import { MoreVertical } from 'lucide-react'

function QuickActionsMenu({ onView, onLogPayment, onExportLedger }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e5ddd2] text-[#7c6f63]"
      >
        <MoreVertical size={16} />
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-40 rounded-2xl border border-[#efe6da] bg-white py-2 text-sm shadow-lg">
          <button
            type="button"
            onClick={() => {
              onView()
              setOpen(false)
            }}
            className="w-full px-4 py-2 text-left text-[#1f1b17] hover:bg-[#fdf7f0]"
          >
            View details
          </button>
          <button
            type="button"
            onClick={() => {
              onLogPayment()
              setOpen(false)
            }}
            className="w-full px-4 py-2 text-left text-[#1f1b17] hover:bg-[#fdf7f0]"
          >
            Log payment
          </button>
          <button
            type="button"
            onClick={() => {
              onExportLedger()
              setOpen(false)
            }}
            className="w-full px-4 py-2 text-left text-[#1f1b17] hover:bg-[#fdf7f0]"
          >
            Export ledger
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default QuickActionsMenu
