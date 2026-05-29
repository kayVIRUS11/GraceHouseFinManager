import { useMemo, useState } from 'react'
import { useSchool } from '../context/school-context.js'
import StatsCard from '../components/StatsCard.jsx'
import InstallmentModal from '../components/InstallmentModal.jsx'
import PaymentLog from '../components/PaymentLog.jsx'
import StudentTable from '../components/StudentTable.jsx'
import AddStudentModal from '../components/AddStudentModal.jsx'
import StudentDetailDrawer from '../components/StudentDetailDrawer.jsx'
import { useAuth } from '../context/auth-context.js'
import { formatCurrency } from '../utils/formatters.js'
import { downloadCsv } from '../utils/csvExport.js'

function Dashboard() {
  const {
    students,
    classLevels,
    payments,
    termInfo,
    missingReceipts,
    isHydrated,
    getAdjustedFee,
    getTotalPaid,
    getOutstanding,
    updateStudent,
    logPayment,
    issueReceipt,
    getLastPaymentDate,
    addStudent
  } = useSchool()
   const { isAdmin } = useAuth()
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false)
  const [detailStudent, setDetailStudent] = useState(null)
  const [paymentStudent, setPaymentStudent] = useState(null)

  const stats = useMemo(() => {
    const totalStudents = students.length
    const owing = students.filter((student) => getOutstanding(student.id) > 0).length
    const cleared = totalStudents - owing
    const pendingReceipts = payments.filter((payment) => !payment.issued).length
    return { totalStudents, owing, cleared, pendingReceipts }
  }, [students, payments, getOutstanding])

  const owingStudents = useMemo(
    () => students.filter((student) => getOutstanding(student.id) > 0),
    [students, getOutstanding]
  )

  const handleExportDebtors = () => {
    const header = ['Name', 'Class', 'Amount Owed']
    const rows = owingStudents.map((student) => [
      `${student.first_name} ${student.last_name}`,
      student.class_level,
      getOutstanding(student.id)
    ])
    downloadCsv('grace-house-debtors.csv', header, rows)
  }

  const handleExportLedgerAll = () => {
    const header = ['Receipt', 'Student', 'Class', 'Date', 'Amount', 'Method', 'Issued']
    const rows = payments.map((payment) => {
      const student = students.find((entry) => entry.id === payment.student_id)
      return [
        payment.receipt_number,
        student ? `${student.first_name} ${student.last_name}` : 'Unknown',
        student ? student.class_level : 'Unknown',
        payment.date,
        payment.amount,
        payment.method,
        payment.issued ? 'Yes' : 'No'
      ]
    })
    downloadCsv('grace-house-ledger.csv', header, rows)
  }

  const handleLogPayment = ({ amount, method }) => {
    if (!paymentStudent) return
    logPayment({ studentId: paymentStudent.id, amount, method })
    setPaymentStudent(null)
  }

  const handleExportStudentLedger = (student) => {
    const ledgerPayments = payments.filter((payment) => payment.student_id === student.id)
    const header = ['Receipt', 'Date', 'Amount', 'Method', 'Issued']
    const rows = ledgerPayments.map((payment) => [
      payment.receipt_number,
      payment.date,
      payment.amount,
      payment.method,
      payment.issued ? 'Yes' : 'No'
    ])
    downloadCsv(`${student.first_name}-${student.last_name}-ledger.csv`, header, rows)
  }


  return (
    <section className="flex flex-col gap-6">
      {!isHydrated ? (
        <div className="rounded-3xl border border-[#e6ded4] bg-white/80 p-5 text-sm text-[#7c6f63]">
          Loading saved data...
        </div>
      ) : null}
       <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#e6ded4] bg-white/80 p-5 shadow-[0_24px_50px_-40px_rgba(31,27,23,0.55)] md:p-6">
         <div>
           <p className="text-[10px] uppercase tracking-[0.28em] text-[#9c8f83] md:text-xs">{termInfo.term}</p>
           <h2 className="mt-2 text-xl font-semibold text-[#1f1b17] md:text-2xl">Grace House School</h2>
           <p className="mt-2 text-xs text-[#7c6f63] md:text-sm">Session {termInfo.session}</p>
         </div>
         <div className="flex flex-wrap items-center gap-3">
           <div className="rounded-2xl border border-dashed border-[#e5ddd2] bg-[#fdf7f0] px-4 py-3 text-sm text-[#7c6f63]">
             Missing receipts: {missingReceipts.length}
           </div>
         </div>
       </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#1f1b17]">Quick actions</h3>
          <p className="text-xs text-[#7c6f63] md:text-sm">Add or search students without leaving the dashboard.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsStudentModalOpen(true)}
            className="rounded-full bg-[#1f1b17] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#fef7ed] transition-all duration-150 active:scale-[0.97] hover:bg-[#3f372e] shadow-[0_4px_12px_-5px_rgba(31,27,23,0.3)]"
          >
            Add student
          </button>
        </div>
      </div>

        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <StatsCard
           label="Total students"
           value={stats.totalStudents}
           helper="Active roster"
           className="p-3"
           labelClassName="tracking-[0.2em]"
           valueClassName="text-lg"
           helperClassName="text-xs"
         />
         <StatsCard
           label="Students cleared"
           value={stats.cleared}
           helper="Paid in full"
           className="p-3"
           labelClassName="tracking-[0.2em]"
           valueClassName="text-lg"
           helperClassName="text-xs"
         />
         <StatsCard
           label="Students owing"
           value={stats.owing}
           helper="Outstanding balances"
           className="p-3"
           labelClassName="tracking-[0.2em]"
           valueClassName="text-lg"
           helperClassName="text-xs"
         />
         <StatsCard
           label="Pending receipts"
           value={stats.pendingReceipts}
           helper="Awaiting issuance"
           className="p-3"
           labelClassName="tracking-[0.2em]"
           valueClassName="text-lg"
           helperClassName="text-xs"
         />
      </div>

      {missingReceipts.length > 0 ? (
        <div className="rounded-3xl border border-[#f1d9b5] bg-[#fff5e4] p-5 text-sm text-[#7a4d0d]">
          Missing receipts alert: {missingReceipts.length} payment(s) have no issued receipt.
        </div>
      ) : null}

      <StudentTable
        students={students}
        classLevels={classLevels}
        getAdjustedFee={getAdjustedFee}
        getTotalPaid={getTotalPaid}
        getOutstanding={getOutstanding}
        updateStudent={updateStudent}
        onViewHistory={setDetailStudent}
        onOpenDetails={setDetailStudent}
        onLogPayment={setPaymentStudent}
        onExportLedger={handleExportStudentLedger}
        arrearsUnlocked={isAdmin}
        getLastPaymentDate={getLastPaymentDate}
        hideFinancialInputs
        compact
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl border border-[#e6ded4] bg-white/80 p-5 shadow-[0_18px_45px_-40px_rgba(31,27,23,0.6)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-[#1f1b17]">Owing students</h3>
              <p className="text-sm text-[#7c6f63]">Students with outstanding balances.</p>
            </div>
            <button
              type="button"
              onClick={handleExportDebtors}
              className="rounded-full border border-[#1f1b17] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#1f1b17] transition-all duration-150 hover:bg-[#1f1b17] hover:text-[#fef7ed] active:scale-95 shadow-[0_4px_10px_-6px_rgba(31,27,23,0.15)]"
            >
              Export
            </button>
          </div>
          <div className="mt-4 grid gap-3">
            {owingStudents.length === 0 ? (
              <p className="text-sm text-[#8b7c70]">All cleared.</p>
            ) : (
              owingStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between rounded-2xl border border-[#efe6da] bg-[#fefaf4] px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[#1f1b17]">
                      {student.first_name} {student.last_name}
                    </p>
                    <p className="text-xs text-[#8b7c70]">{student.class_level}</p>
                  </div>
                  <span className="text-sm font-semibold text-[#9a3d2a]">
                    {formatCurrency(getOutstanding(student.id))}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
        <PaymentLog
          payments={payments.slice().reverse().slice(0, 5)}
          issueReceipt={issueReceipt}
          onExport={handleExportLedgerAll}
        />
      </div>

      <AddStudentModal
        isOpen={isStudentModalOpen}
        classLevels={classLevels}
        onClose={() => setIsStudentModalOpen(false)}
        onSave={addStudent}
      />

      <StudentDetailDrawer
        isOpen={Boolean(detailStudent)}
        student={detailStudent}
        fee={detailStudent ? getAdjustedFee(detailStudent) : 0}
        totalPaid={detailStudent ? getTotalPaid(detailStudent.id) : 0}
        outstanding={detailStudent ? getOutstanding(detailStudent.id) : 0}
        payments={payments.filter((payment) => payment.student_id === detailStudent?.id)}
        onClose={() => setDetailStudent(null)}
        onIssueReceipt={issueReceipt}
        onLogPayment={() => {
          setPaymentStudent(detailStudent)
          setDetailStudent(null)
        }}
      />

      {paymentStudent ? (
        <InstallmentModal
          isOpen
          entity={paymentStudent}
          balance={getOutstanding(paymentStudent.id)}
          onClose={() => setPaymentStudent(null)}
          onSubmit={handleLogPayment}
        />
      ) : null}
    </section>
  )
}

export default Dashboard
