import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MoreVertical } from 'lucide-react'

function QuickActionsMenu({ onView, onLogPayment, onExportLedger }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  const updatePosition = () => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const menuWidth = 160
    const left = Math.max(16, rect.right - menuWidth)
    const top = rect.bottom + 8
    setPosition({ top, left })
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useLayoutEffect(() => {
    if (!open) return
    updatePosition()
    const handleResize = () => updatePosition()
    const handleScroll = () => updatePosition()
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, true)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [open])

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        ref={buttonRef}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e5ddd2] text-[#7c6f63] transition hover:border-[#1f1b17] hover:text-[#1f1b17]"
      >
        <MoreVertical size={16} />
      </button>
      {open
        ? createPortal(
            <div
              className="fixed z-[60] w-40 rounded-2xl border border-[#efe6da] bg-white py-2 text-sm shadow-lg"
              style={{ top: `${position.top}px`, left: `${position.left}px` }}
              ref={menuRef}
            >
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
            </div>,
            document.body
          )
        : null}
    </div>
  )
}

export default QuickActionsMenu
