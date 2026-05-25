import { useMemo, useState } from 'react'
import QuickActionsMenu from './QuickActionsMenu.jsx'

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(value)

function StudentTable({
  students,
  classLevels,
  getAdjustedFee,
  getTotalPaid,
  getOutstanding,
  updateStudent,
  onViewHistory,
  onOpenDetails,
  onLogPayment,
  onExportLedger,
  onUnlockArrears,
  arrearsUnlocked,
  getLastPaymentDate
}) {
  const [query, setQuery] = useState('')
  const [filterClass, setFilterClass] = useState('All')
  const [sortKey, setSortKey] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')

  const filtered = useMemo(() => {
    const result = students.filter((student) => {
      const matchesQuery = `${student.first_name} ${student.last_name}`
        .toLowerCase()
        .includes(query.toLowerCase())
      const matchesClass = filterClass === 'All' || student.class_level === filterClass
      return matchesQuery && matchesClass
    })

    const sorted = [...result].sort((a, b) => {
      if (sortKey === 'name') {
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase()
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase()
        return nameA.localeCompare(nameB)
      }
      if (sortKey === 'class') {
        return a.class_level.localeCompare(b.class_level)
      }
      if (sortKey === 'outstanding') {
        return getOutstanding(a.id) - getOutstanding(b.id)
      }
      if (sortKey === 'paid') {
        return getTotalPaid(a.id) - getTotalPaid(b.id)
      }
      if (sortKey === 'lastPayment') {
        const lastA = getLastPaymentDate(a.id) || ''
        const lastB = getLastPaymentDate(b.id) || ''
        return String(lastA).localeCompare(String(lastB))
      }
      return 0
    })

    if (sortDirection === 'desc') {
      sorted.reverse()
    }

    return sorted
  }, [
    students,
    query,
    filterClass,
    sortKey,
    sortDirection,
    getOutstanding,
    getTotalPaid,
    getLastPaymentDate
  ])

  return (
    <div className="rounded-3xl border border-[#e6ded4] bg-white/80 shadow-[0_18px_45px_-40px_rgba(31,27,23,0.6)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#efe6da] px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-[#1f1b17]">Student fee directory</h2>
          <p className="text-sm text-[#7c6f63]">Search by name or filter by class.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search student"
            className="rounded-full border border-[#e5ddd2] bg-white px-4 py-2 text-sm text-[#1f1b17]"
          />
          <select
            value={filterClass}
            onChange={(event) => setFilterClass(event.target.value)}
            className="rounded-full border border-[#e5ddd2] bg-white px-4 py-2 text-sm text-[#1f1b17]"
          >
            <option value="All">All classes</option>
            {classLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <select
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value)}
            className="rounded-full border border-[#e5ddd2] bg-white px-4 py-2 text-sm text-[#1f1b17]"
          >
            <option value="name">Sort by name</option>
            <option value="class">Sort by class</option>
            <option value="outstanding">Sort by owing</option>
            <option value="paid">Sort by paid</option>
            <option value="lastPayment">Sort by last payment</option>
          </select>
          <button
            type="button"
            onClick={() =>
              setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
            }
            className="rounded-full border border-[#e5ddd2] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#7c6f63]"
          >
            {sortDirection === 'asc' ? 'Asc' : 'Desc'}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#fdf7f0] text-xs uppercase tracking-[0.2em] text-[#8b7c70]">
            <tr>
              <th className="px-6 py-3">Student</th>
              <th className="px-6 py-3">Term fee</th>
              <th className="px-6 py-3">Scholarship</th>
              <th className="px-6 py-3">Arrears</th>
              <th className="px-6 py-3">Total paid</th>
              <th className="px-6 py-3">Outstanding</th>
              <th className="px-6 py-3">History</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#efe6da]">
            {filtered.map((student) => {
              const fee = getAdjustedFee(student)
              const totalPaid = getTotalPaid(student.id)
              const outstanding = getOutstanding(student.id)
              const isCleared = outstanding <= 0

              return (
                <tr key={student.id} className="text-[#1f1b17]">
                  <td className="px-6 py-4">
                    <p className="font-semibold">{student.first_name} {student.last_name}</p>
                    <p className="text-xs text-[#8b7c70]">{student.class_level}</p>
                  </td>
                  <td className="px-6 py-4">{formatCurrency(fee)}</td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      min="0"
                      value={student.adjusted_fee || ''}
                      onChange={(event) =>
                        updateStudent(student.id, { adjusted_fee: Number(event.target.value || 0) })
                      }
                      placeholder="0"
                      className="w-28 rounded-xl border border-[#e5ddd2] bg-white px-3 py-2 text-sm"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={student.arrears || ''}
                        onChange={(event) =>
                          updateStudent(student.id, { arrears: Number(event.target.value || 0) })
                        }
                        placeholder="0"
                        disabled={!arrearsUnlocked}
                        className="w-28 rounded-xl border border-[#e5ddd2] bg-white px-3 py-2 text-sm disabled:bg-[#fdf7f0]"
                      />
                      <button
                        type="button"
                        onClick={() => onUnlockArrears(student)}
                        className="rounded-full border border-[#e5ddd2] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7c6f63]"
                      >
                        Unlock
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">{formatCurrency(totalPaid)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                        isCleared
                          ? 'bg-[#d7f3e3] text-[#2b5d3c]'
                          : 'bg-[#f8d7d4] text-[#6b2f2a]'
                      }`}
                    >
                      {formatCurrency(outstanding)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => onViewHistory(student)}
                      className="rounded-full border border-[#1f1b17] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#1f1b17]"
                    >
                      View
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <QuickActionsMenu
                      onView={() => onOpenDetails(student)}
                      onLogPayment={() => onLogPayment(student)}
                      onExportLedger={() => onExportLedger(student)}
                    />
                  </td>
                </tr>
              )}
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StudentTable
