import { useState } from 'react'

function AdminPinModal({ isOpen, onClose, onVerify }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = () => {
    const ok = onVerify(pin)
    if (!ok) {
      setError('Incorrect PIN')
      return
    }
    setPin('')
    setError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1b17]/60 px-4 py-8 backdrop-blur">
      <div className="w-full max-w-sm rounded-[24px] border border-[#efe6da] bg-[#fefaf4] p-6 shadow-[0_30px_60px_-30px_rgba(15,12,8,0.7)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-[#8b7c70]">Admin access</p>
            <h3 className="mt-2 text-xl font-semibold text-[#1f1b17]">Enter PIN</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#e5ddd2] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#8b7c70]"
          >
            Close
          </button>
        </div>
        <div className="mt-5 grid gap-3">
          <input
            type="password"
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            placeholder="Enter PIN"
            className="rounded-2xl border border-[#e5ddd2] bg-white px-4 py-3 text-base text-[#1f1b17]"
          />
          {error ? <p className="text-xs text-[#9a3d2a]">{error}</p> : null}
        </div>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-full bg-[#1f1b17] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#fef7ed]"
          >
            Unlock
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminPinModal
