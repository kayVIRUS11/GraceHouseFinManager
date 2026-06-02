import { createPortal } from 'react-dom'

function ConfirmAdminModal({ isOpen, title, message, confirmLabel = 'Confirm', onCancel, onConfirm }) {
  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1b17]/60 px-4 py-8 backdrop-blur" role="presentation">
      <div className="w-full max-w-sm rounded-[24px] border border-[#efe6da] bg-[#fefaf4] p-6 shadow-[0_30px_60px_-30px_rgba(15,12,8,0.7)]">
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-[#8b7c70]">Admin action</p>
          <h3 className="mt-2 text-xl font-semibold text-[#1f1b17]">{title}</h3>
          <p className="mt-2 text-sm text-[#7c6f63]">{message}</p>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-[#e5ddd2] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#7c6f63]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-[#1f1b17] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#fef7ed]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ConfirmAdminModal
