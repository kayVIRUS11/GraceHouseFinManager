import { useMemo, useRef } from 'react'
import { exportNodeToPdf } from '../utils/reportExport.js'

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(value)

const getMonthLabel = (value) => {
  const [year, month] = value.split('-')
  return `${month}/${year.slice(-2)}`
}

function ReportsPanel({ students, payments, classLevels, getAdjustedFee, getOutstanding }) {
  const reportRef = useRef(null)
  const summary = useMemo(() => {
    const totalExpected = students.reduce(
      (acc, student) => acc + getAdjustedFee(student) + Number(student.arrears || 0),
      0
    )
    const totalCollected = payments.reduce((acc, payment) => acc + Number(payment.amount || 0), 0)
    const totalOutstanding = students.reduce(
      (acc, student) => acc + Math.max(getOutstanding(student.id), 0),
      0
    )
    return { totalExpected, totalCollected, totalOutstanding }
  }, [students, payments, getAdjustedFee, getOutstanding])

  const classBreakdown = useMemo(() => {
    return classLevels.map((level) => {
      const classStudents = students.filter((student) => student.class_level === level)
      const expected = classStudents.reduce(
        (acc, student) => acc + getAdjustedFee(student) + Number(student.arrears || 0),
        0
      )
      const paid = classStudents.reduce((acc, student) => {
        const studentPayments = payments.filter((payment) => payment.student_id === student.id)
        return acc + studentPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
      }, 0)
      const outstanding = Math.max(expected - paid, 0)
      return { level, expected, paid, outstanding }
    })
  }, [students, payments, classLevels, getAdjustedFee])

  const methodSplit = useMemo(() => {
    const methods = ['cash', 'transfer', 'pos', 'cheque']
    const totals = methods.map((method) => ({
      method,
      amount: payments
        .filter((payment) => payment.method === method)
        .reduce((acc, payment) => acc + Number(payment.amount || 0), 0)
    }))
    return totals
  }, [payments])

  const timeline = useMemo(() => {
    const grouped = payments.reduce((acc, payment) => {
      const date = new Date(payment.date)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      acc[key] = (acc[key] || 0) + Number(payment.amount || 0)
      return acc
    }, {})
    const keys = Object.keys(grouped).sort()
    const recent = keys.slice(-6)
    return recent.map((key) => ({ key, amount: grouped[key] }))
  }, [payments])

  const maxTimeline = Math.max(...timeline.map((item) => item.amount), 1)
  const maxClass = Math.max(...classBreakdown.map((item) => item.expected), 1)
  const maxMethod = Math.max(...methodSplit.map((item) => item.amount), 1)

  const handleExportSection = async (selector, filename) => {
    if (!reportRef.current) return
    const node = reportRef.current.querySelector(selector)
    await exportNodeToPdf(node, filename)
  }

  const handleExportFull = async () => {
    await exportNodeToPdf(reportRef.current, 'grace-house-report.pdf')
  }

  return (
    <section ref={reportRef} className="rounded-[32px] border border-[#e6ded4] bg-white/70 p-6 shadow-[0_18px_45px_-40px_rgba(31,27,23,0.6)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#9c8f83]">Financial report</p>
          <h3 className="mt-2 text-2xl font-semibold text-[#1f1b17]">Grace House Term Overview</h3>
          <p className="mt-2 text-sm text-[#7c6f63]">
            Shareable report for school owners and stakeholders.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportFull}
            className="rounded-full bg-[#1f1b17] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#fef7ed]"
          >
            Download full report
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
      <div className="grid gap-4">
        <div
          className="rounded-3xl border border-[#e6ded4] bg-white/80 p-6 shadow-[0_18px_45px_-40px_rgba(31,27,23,0.6)]"
          data-section="summary"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold text-[#1f1b17]">Term summary</h3>
            <button
              type="button"
              onClick={() => handleExportSection('[data-section="summary"]', 'term-summary.pdf')}
              className="rounded-full border border-[#1f1b17] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#1f1b17]"
            >
              Download
            </button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#efe6da] bg-[#fefaf4] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8b7c70]">Expected</p>
              <p className="mt-2 text-sm font-semibold text-[#1f1b17]">
                {formatCurrency(summary.totalExpected)}
              </p>
            </div>
            <div className="rounded-2xl border border-[#efe6da] bg-[#fefaf4] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8b7c70]">Collected</p>
              <p className="mt-2 text-sm font-semibold text-[#1f1b17]">
                {formatCurrency(summary.totalCollected)}
              </p>
            </div>
            <div className="rounded-2xl border border-[#efe6da] bg-[#fefaf4] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8b7c70]">Outstanding</p>
              <p className="mt-2 text-sm font-semibold text-[#9a3d2a]">
                {formatCurrency(summary.totalOutstanding)}
              </p>
            </div>
          </div>
        </div>

        <div
          className="rounded-3xl border border-[#e6ded4] bg-white/80 p-6 shadow-[0_18px_45px_-40px_rgba(31,27,23,0.6)]"
          data-section="timeline"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-[#1f1b17]">Collections timeline</h3>
              <p className="mt-1 text-sm text-[#7c6f63]">Last 6 months of receipts.</p>
            </div>
            <button
              type="button"
              onClick={() => handleExportSection('[data-section="timeline"]', 'collections-timeline.pdf')}
              className="rounded-full border border-[#1f1b17] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#1f1b17]"
            >
              Download
            </button>
          </div>
          <div className="mt-4 grid gap-3">
            {timeline.length === 0 ? (
              <p className="text-sm text-[#8b7c70]">No payments yet.</p>
            ) : (
              timeline.map((item) => (
                <div key={item.key} className="grid gap-2">
                  <div className="flex items-center justify-between text-xs text-[#8b7c70]">
                    <span>{getMonthLabel(item.key)}</span>
                    <span className="font-semibold text-[#1f1b17]">{formatCurrency(item.amount)}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#efe6da]">
                    <div
                      className="h-2 rounded-full bg-[#1f1b17]"
                      style={{ width: `${(item.amount / maxTimeline) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <div
          className="rounded-3xl border border-[#e6ded4] bg-white/80 p-6 shadow-[0_18px_45px_-40px_rgba(31,27,23,0.6)]"
          data-section="classes"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold text-[#1f1b17]">Class breakdown</h3>
            <button
              type="button"
              onClick={() => handleExportSection('[data-section="classes"]', 'class-breakdown.pdf')}
              className="rounded-full border border-[#1f1b17] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#1f1b17]"
            >
              Download
            </button>
          </div>
          <div className="mt-4 grid gap-3">
            {classBreakdown.map((row) => (
              <div key={row.level} className="rounded-2xl border border-[#efe6da] bg-[#fefaf4] px-4 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-[#1f1b17]">{row.level}</span>
                  <span className="text-xs text-[#8b7c70]">{formatCurrency(row.outstanding)}</span>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-[#efe6da]">
                  <div
                    className="h-2 rounded-full bg-[#1f1b17]"
                    style={{ width: `${(row.paid / maxClass) * 100}%` }}
                  ></div>
                </div>
                <p className="mt-2 text-xs text-[#8b7c70]">
                  Paid {formatCurrency(row.paid)} of {formatCurrency(row.expected)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-3xl border border-[#e6ded4] bg-white/80 p-6 shadow-[0_18px_45px_-40px_rgba(31,27,23,0.6)]"
          data-section="methods"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold text-[#1f1b17]">Payment methods</h3>
            <button
              type="button"
              onClick={() => handleExportSection('[data-section="methods"]', 'payment-methods.pdf')}
              className="rounded-full border border-[#1f1b17] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#1f1b17]"
            >
              Download
            </button>
          </div>
          <div className="mt-4 grid gap-3">
            {methodSplit.map((row) => (
              <div key={row.method} className="grid gap-2">
                <div className="flex items-center justify-between text-xs text-[#8b7c70]">
                  <span>{row.method.toUpperCase()}</span>
                  <span className="font-semibold text-[#1f1b17]">{formatCurrency(row.amount)}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#efe6da]">
                  <div
                    className="h-2 rounded-full bg-[#3a332c]"
                    style={{ width: `${(row.amount / maxMethod) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </section>
  )
}

export default ReportsPanel
