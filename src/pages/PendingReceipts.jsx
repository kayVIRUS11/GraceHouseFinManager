import { useMemo } from 'react'
import { useSchool } from '../context/SchoolContext.jsx'

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(value)

function PendingReceipts() {
  const { payments, students, issueReceipt } = useSchool()

  const pending = useMemo(
    () => payments.filter((payment) => !payment.issued),
    [payments]
  )

  const handleExport = () => {
    const header = ['Receipt', 'Student', 'Class', 'Date', 'Amount', 'Method']
    const rows = pending.map((payment) => {
      const student = students.find((entry) => entry.id === payment.student_id)
      return [
        payment.receipt_number,
        student ? `${student.first_name} ${student.last_name}` : 'Unknown',
        student ? student.class_level : 'Unknown',
        payment.date,
        payment.amount,
        payment.method
      ]
    })
    if (rows.length === 0) return
    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'grace-house-pending-receipts.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#9c8f83]">Receipts</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#1f1b17]">Pending receipts</h2>
          <p className="mt-2 text-sm text-[#7c6f63]">Issue receipts after verifying each payment.</p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="rounded-full border border-[#1f1b17] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#1f1b17]"
        >
          Export list
        </button>
      </header>

      <div className="rounded-3xl border border-[#e6ded4] bg-white/80 shadow-[0_18px_45px_-40px_rgba(31,27,23,0.6)]">
        <div className="divide-y divide-[#efe6da]">
          {pending.length === 0 ? (
            <div className="px-6 py-8 text-sm text-[#8b7c70]">No pending receipts.</div>
          ) : (
            pending.map((payment) => {
              const student = students.find((entry) => entry.id === payment.student_id)
              return (
                <div key={payment.id} className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-base font-semibold text-[#1f1b17]">
                      {student ? `${student.first_name} ${student.last_name}` : 'Unknown student'}
                    </p>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#8c7b6e]">
                      {student ? student.class_level : 'Unknown class'}
                    </p>
                    <p className="mt-2 text-xs text-[#8b7c70]">
                      {new Date(payment.date).toLocaleString()} · {payment.method.toUpperCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-[#8b7c70]">Amount</p>
                      <p className="text-lg font-semibold text-[#1f1b17]">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => issueReceipt(payment.id)}
                      className="rounded-full bg-[#f2c278] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#4d3510]"
                    >
                      Issue receipt
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}

export default PendingReceipts
