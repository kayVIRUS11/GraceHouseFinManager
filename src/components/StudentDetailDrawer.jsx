import { formatCurrency } from '../utils/formatters.js'

function StudentDetailDrawer({
  isOpen,
  student,
  fee,
  totalPaid,
  outstanding,
  payments,
  onClose,
  onIssueReceipt,
  onLogPayment
}) {
  if (!isOpen || !student) return null

  const issuedCount = payments.filter((payment) => payment.issued).length
  const unissuedCount = payments.length - issuedCount

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1b17]/40 backdrop-blur px-4 py-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-[#efe6da] bg-[#fefaf4] p-6 shadow-[0_30px_60px_-30px_rgba(15,12,8,0.7)]"
        onClick={(event) => event.stopPropagation()}
        role="presentation"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-[#8b7c70]">Student profile</p>
            <h3 className="mt-2 text-2xl font-semibold text-[#1f1b17]">
              {student.first_name} {student.last_name}
            </h3>
            <p className="mt-1 text-sm text-[#7c6f63]">{student.class_level}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#e5ddd2] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#8b7c70]"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          <div className="rounded-2xl border border-[#efe6da] bg-white px-4 py-4">
            <div className="grid gap-3">
              <div className="flex items-center justify-between text-sm text-[#7c6f63]">
                <span>Term fee</span>
                <span className="font-semibold text-[#1f1b17]">{formatCurrency(fee)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-[#7c6f63]">
                <span>Arrears</span>
                <span className="font-semibold text-[#1f1b17]">{formatCurrency(student.arrears || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-[#7c6f63]">
                <span>Total paid</span>
                <span className="font-semibold text-[#1f1b17]">{formatCurrency(totalPaid)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-[#7c6f63]">
                <span>Outstanding</span>
                <span className="font-semibold text-[#9a3d2a]">{formatCurrency(outstanding)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#efe6da] bg-white px-4 py-4">
            <p className="text-sm font-semibold text-[#1f1b17]">Receipts</p>
            <div className="mt-2 flex items-center gap-3 text-xs text-[#7c6f63]">
              <span className="rounded-full bg-[#d7f3e3] px-3 py-1 font-semibold uppercase tracking-[0.18em] text-[#2b5d3c]">
                Issued {issuedCount}
              </span>
              <span className="rounded-full bg-[#f8d7d4] px-3 py-1 font-semibold uppercase tracking-[0.18em] text-[#6b2f2a]">
                Unissued {unissuedCount}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#efe6da] bg-white px-4 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#1f1b17]">Payment history</p>
              <button
                type="button"
                onClick={onLogPayment}
                className="rounded-full bg-[#1f1b17] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#fef7ed]"
              >
                Log payment
              </button>
            </div>
            <div className="mt-4">
              {payments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#e5ddd2] bg-[#fefaf4] px-3 py-4 text-center text-sm text-[#8b7c70]">
                  No payments logged yet.
                </div>
              ) : (
                <div className="divide-y divide-[#efe6da]">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex flex-col gap-3 py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[#1f1b17]">
                            {formatCurrency(payment.amount)} via {payment.method.toUpperCase()}
                          </p>
                          <p className="text-xs text-[#8b7c70]">
                            {new Date(payment.date).toLocaleString()}
                          </p>
                        </div>
                        {payment.issued ? (
                          <span className="rounded-full bg-[#d7f3e3] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#2b5d3c]">
                            Issued ({payment.receipt_number})
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onIssueReceipt(payment.id)}
                            className="rounded-full bg-[#f2c278] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#4d3510]"
                          >
                            Issue receipt
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#efe6da] bg-[#fdf7f0] px-4 py-4 text-sm text-[#7c6f63]">
            <p className="font-semibold text-[#1f1b17]">Parent contact</p>
            <p className="mt-1">{student.parent_name}</p>
            <p className="mt-1">{student.parent_whatsapp}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDetailDrawer
