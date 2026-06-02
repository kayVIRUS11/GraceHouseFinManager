import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

function AddStudentModal({ isOpen, classLevels, onClose, onSave }) {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    class_level: classLevels[0],
    parent_name: '',
    parent_whatsapp: '',
    adjusted_fee: 0,
    arrears: 0
  })

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    onSave(form)
    onClose()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1b17]/60 px-4 py-8 backdrop-blur"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[28px] border border-[#efe6da] bg-[#fefaf4] p-6 shadow-[0_30px_60px_-30px_rgba(15,12,8,0.7)]"
        onClick={(event) => event.stopPropagation()}
        role="presentation"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-[#8b7c70]">New student</p>
            <h3 className="mt-2 text-xl font-semibold text-[#1f1b17]">Add student profile</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#e5ddd2] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#8b7c70]"
          >
            Close
          </button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm text-[#7c6f63]">
            First name
            <input
              value={form.first_name}
              onChange={(event) => handleChange('first_name', event.target.value)}
              className="rounded-2xl border border-[#e5ddd2] bg-white px-4 py-3 text-base text-[#1f1b17]"
            />
          </label>
          <label className="grid gap-2 text-sm text-[#7c6f63]">
            Last name
            <input
              value={form.last_name}
              onChange={(event) => handleChange('last_name', event.target.value)}
              className="rounded-2xl border border-[#e5ddd2] bg-white px-4 py-3 text-base text-[#1f1b17]"
            />
          </label>
          <label className="grid gap-2 text-sm text-[#7c6f63]">
            Class
            <select
              value={form.class_level}
              onChange={(event) => handleChange('class_level', event.target.value)}
              className="rounded-2xl border border-[#e5ddd2] bg-white px-4 py-3 text-base text-[#1f1b17]"
            >
              {classLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-[#7c6f63]">
            Parent name
            <input
              value={form.parent_name}
              onChange={(event) => handleChange('parent_name', event.target.value)}
              className="rounded-2xl border border-[#e5ddd2] bg-white px-4 py-3 text-base text-[#1f1b17]"
            />
          </label>
          <label className="grid gap-2 text-sm text-[#7c6f63]">
            Parent WhatsApp
            <input
              value={form.parent_whatsapp}
              onChange={(event) => handleChange('parent_whatsapp', event.target.value)}
              className="rounded-2xl border border-[#e5ddd2] bg-white px-4 py-3 text-base text-[#1f1b17]"
            />
          </label>
          <label className="grid gap-2 text-sm text-[#7c6f63]">
            Scholarship override
            <input
              type="number"
              min="0"
              value={form.adjusted_fee}
              onChange={(event) => handleChange('adjusted_fee', Number(event.target.value || 0))}
              className="rounded-2xl border border-[#e5ddd2] bg-white px-4 py-3 text-base text-[#1f1b17]"
            />
          </label>
          <label className="grid gap-2 text-sm text-[#7c6f63]">
            Carried arrears
            <input
              type="number"
              min="0"
              value={form.arrears}
              onChange={(event) => handleChange('arrears', Number(event.target.value || 0))}
              className="rounded-2xl border border-[#e5ddd2] bg-white px-4 py-3 text-base text-[#1f1b17]"
            />
          </label>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#e5ddd2] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#7c6f63]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-full bg-[#1f1b17] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#fef7ed]"
          >
            Save student
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default AddStudentModal
