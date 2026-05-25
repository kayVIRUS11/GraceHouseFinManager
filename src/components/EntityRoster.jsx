const formatCurrency = (value) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(value)

function EntityRoster({ students, onNewPayment, getAdjustedFee, getTotalPaid, getOutstanding }) {
  return (
    <div className="rounded-3xl border border-[#e6ded4] bg-white/80 shadow-[0_18px_45px_-40px_rgba(31,27,23,0.6)]">
      <div className="flex items-start justify-between gap-4 border-b border-[#efe6da] px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-[#1f1b17]">Students</h2>
          <p className="text-sm text-[#7c6f63]">
            Active roster with outstanding balances
          </p>
        </div>
        <button
          type="button"
          className="rounded-full border border-[#1f1b17] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#1f1b17] transition hover:bg-[#1f1b17] hover:text-[#fef7ed]"
        >
          Export ledger
        </button>
      </div>
      <div className="divide-y divide-[#efe6da]">
        {students.map((student) => {
          const balance = getOutstanding(student.id)
          const totalPaid = getTotalPaid(student.id)
          const fee = getAdjustedFee(student)

          return (
            <div key={student.id} className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-base font-semibold text-[#1f1b17]">
                  {student.first_name} {student.last_name}
                </p>
                <p className="text-xs uppercase tracking-[0.24em] text-[#8c7b6e]">
                  {student.class_level}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-[#8b7c70]">Fee / Paid</p>
                  <p className="text-lg font-semibold text-[#1f1b17]">{formatCurrency(fee)}</p>
                  <p className="text-xs text-[#8b7c70]">Paid {formatCurrency(totalPaid)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onNewPayment(student)}
                  className="rounded-full bg-[#1f1b17] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#fef7ed] shadow-[0_12px_20px_-14px_rgba(31,27,23,0.8)] transition hover:bg-[#3a332c]"
                >
                  Log payment
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default EntityRoster
