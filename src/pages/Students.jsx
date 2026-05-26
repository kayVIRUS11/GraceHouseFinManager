import { useMemo, useState } from 'react'
import { useSchool } from '../context/school-context.js'
import StudentTable from '../components/StudentTable.jsx'
import AddStudentModal from '../components/AddStudentModal.jsx'
import StudentDetailDrawer from '../components/StudentDetailDrawer.jsx'
import InstallmentModal from '../components/InstallmentModal.jsx'
import { useAuth } from '../context/auth-context.js'
import { downloadCsv } from '../utils/csvExport.js'

function Students() {
  const {
    students,
    classLevels,
    addStudent,
    getAdjustedFee,
    getTotalPaid,
    getOutstanding,
    updateStudent,
    payments,
    issueReceipt,
    logPayment,
    getLastPaymentDate,
    isHydrated
  } = useSchool()
  const { isAdmin } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [detailStudent, setDetailStudent] = useState(null)
  const [paymentStudent, setPaymentStudent] = useState(null)

  const detailPayments = useMemo(() => {
    if (!detailStudent) return []
    return payments.filter((payment) => payment.student_id === detailStudent.id)
  }, [payments, detailStudent])

  const handleLogPayment = ({ amount, method }) => {
    if (!paymentStudent) return
    logPayment({ studentId: paymentStudent.id, amount, method })
    setPaymentStudent(null)
  }

  const handleExportLedger = (student) => {
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
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#9c8f83]">Directory</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#1f1b17]">Student fee directory</h2>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="rounded-full bg-[#1f1b17] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#fef7ed]"
        >
          Add student
        </button>
      </header>

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
        onExportLedger={handleExportLedger}
        arrearsUnlocked={isAdmin}
        getLastPaymentDate={getLastPaymentDate}
      />

      <AddStudentModal
        isOpen={isModalOpen}
        classLevels={classLevels}
        onClose={() => setIsModalOpen(false)}
        onSave={addStudent}
      />

      <StudentDetailDrawer
        isOpen={Boolean(detailStudent)}
        student={detailStudent}
        fee={detailStudent ? getAdjustedFee(detailStudent) : 0}
        totalPaid={detailStudent ? getTotalPaid(detailStudent.id) : 0}
        outstanding={detailStudent ? getOutstanding(detailStudent.id) : 0}
        payments={detailPayments}
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

export default Students
