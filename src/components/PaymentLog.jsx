import { formatCurrency } from '../utils/formatters.js'

function PaymentLog({ payments, issueReceipt, onExport }) {
  return (
    <div className="rounded-3xl border border-[#e6ded4] bg-white/80 shadow-[0_18px_45px_-40px_rgba(31,27,23,0.6)]">
      <div className="flex items-start justify-between gap-4 border-b border-[#efe6da] px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-[#1f1b17]">Recent payments</h2>
          <p className="text-sm text-[#7c6f63]">Issue receipts after verifying payment.</p>
        </div>
        <button
          type="button"
          onClick={onExport}
          className="rounded-full border border-[#1f1b17] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#1f1b17] transition-all duration-150 hover:bg-[#1f1b17] hover:text-[#fef7ed] active:scale-95 shadow-[0_4px_10px_-6px_rgba(31,27,23,0.15)]"
        >
          Export ledger
        </button>
      </div>
      <div className="divide-y divide-[#efe6da]">
        {payments.length === 0 ? (
          <div className="px-6 py-8 text-sm text-[#8b7c70]">No payments logged yet.</div>
        ) : (
          payments.map((payment) => (
            <div key={payment.id} className="flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#1f1b17]">
                  {formatCurrency(payment.amount)} via {payment.method.toUpperCase()}
                </p>
                <p className="text-xs text-[#8b7c70]">
                  {new Date(payment.date).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {payment.issued ? (
                  <span className="rounded-full bg-[#d7f3e3] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#2b5d3c]">
                    Issued ({payment.receipt_number})
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => issueReceipt(payment.id)}
                    className="rounded-full bg-[#f2c278] hover:bg-[#eeb156] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#4d3510] transition-all duration-150 active:scale-95 shadow-[0_4px_10px_-6px_rgba(242,194,120,0.4)]"
                  >
                    Issue receipt
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default PaymentLog
