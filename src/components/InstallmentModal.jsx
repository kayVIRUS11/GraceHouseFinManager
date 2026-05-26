import { useMemo, useState } from 'react'
import { paymentMethods } from '../data/paymentMethods.js'
import { formatCurrency } from '../utils/formatters.js'

function InstallmentModal({ isOpen, entity, balance, onClose, onSubmit }) {
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState(paymentMethods[0].value)

  const amountValue = useMemo(() => Number(amount || 0), [amount])
  const newBalance = Math.max(balance - amountValue, 0)

  if (!isOpen || !entity) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1b17]/60 px-4 py-8 backdrop-blur">
      <div className="w-full max-w-lg rounded-[28px] border border-[#efe6da] bg-[#fefaf4] p-6 shadow-[0_30px_60px_-30px_rgba(15,12,8,0.7)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-[#8b7c70]">
              New installment
            </p>
            <h3 className="mt-2 text-xl font-semibold text-[#1f1b17]">
              Log payment for {entity.first_name} {entity.last_name}
            </h3>
            <p className="mt-1 text-sm text-[#7c6f63]">Class: {entity.class_level}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#e5ddd2] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#8b7c70] hover:border-[#1f1b17] hover:text-[#1f1b17]"
          >
            Close
          </button>
        </div>
        <div className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm text-[#7c6f63]">
            Amount received
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter amount"
              className="rounded-2xl border border-[#e5ddd2] bg-white px-4 py-3 text-base text-[#1f1b17] focus:outline-none focus:ring-2 focus:ring-[#1f1b17]/20"
            />
          </label>
          <label className="grid gap-2 text-sm text-[#7c6f63]">
            Payment method
            <select
              value={method}
              onChange={(event) => setMethod(event.target.value)}
              className="rounded-2xl border border-[#e5ddd2] bg-white px-4 py-3 text-base text-[#1f1b17] focus:outline-none focus:ring-2 focus:ring-[#1f1b17]/20"
            >
              {paymentMethods.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-3 rounded-2xl border border-dashed border-[#e5ddd2] bg-white px-4 py-3">
            <div className="flex items-center justify-between text-sm text-[#7c6f63]">
              <span>Current outstanding</span>
              <span className="font-semibold text-[#1f1b17]">
                {formatCurrency(balance)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-[#7c6f63]">
              <span>Balance after receipt</span>
              <span className="font-semibold text-[#1f1b17]">
                {formatCurrency(newBalance)}
              </span>
            </div>
          </div>
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
            onClick={() => onSubmit({ amount: amountValue, method })}
            disabled={!amountValue || amountValue <= 0}
            className="rounded-full bg-[#1f1b17] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#fef7ed] shadow-[0_12px_20px_-14px_rgba(31,27,23,0.8)] transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            Confirm payment
          </button>
        </div>
      </div>
    </div>
  )
}

export default InstallmentModal
