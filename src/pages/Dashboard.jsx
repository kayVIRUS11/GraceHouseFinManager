import { useMemo, useState } from 'react'
import { useSchool } from '../context/SchoolContext.jsx'
import StatsCard from '../components/StatsCard.jsx'
import InstallmentModal from '../components/InstallmentModal.jsx'
import PaymentLog from '../components/PaymentLog.jsx'
import StudentTable from '../components/StudentTable.jsx'
import AddStudentModal from '../components/AddStudentModal.jsx'
import StudentDetailDrawer from '../components/StudentDetailDrawer.jsx'
import AdminPinModal from '../components/AdminPinModal.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(value)

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
    verifyAdminPin,
    addStudent
  } = useSchool()
  const { signOut } = useAuth()
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false)
  const [detailStudent, setDetailStudent] = useState(null)
  const [paymentStudent, setPaymentStudent] = useState(null)
  const [arrearsUnlocked, setArrearsUnlocked] = useState(false)
  const [isPinOpen, setIsPinOpen] = useState(false)

  const stats = useMemo(() => {
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
    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'grace-house-debtors.csv'
    link.click()
    URL.revokeObjectURL(url)
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
    if (rows.length === 0) {
      return
    }
    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'grace-house-ledger.csv'
    link.click()
    URL.revokeObjectURL(url)
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
    if (rows.length === 0) {
      return
    }
    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${student.first_name}-${student.last_name}-ledger.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleUnlockArrears = () => {
    setIsPinOpen(true)
  }

  const handlePinVerify = (pin) => {
    const ok = verifyAdminPin(pin)
    if (ok) {
      setArrearsUnlocked(true)
      setIsPinOpen(false)
    }
    return ok
  }

  return (
    <section className="flex flex-col gap-6">
      {!isHydrated ? (
        <div className="rounded-3xl border border-[#e6ded4] bg-white/80 p-5 text-sm text-[#7c6f63]">
          Loading saved data...
        </div>
      ) : null}
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#e6ded4] bg-white/80 p-6 shadow-[0_18px_45px_-40px_rgba(31,27,23,0.6)]">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#9c8f83]">{termInfo.term}</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#1f1b17]">Grace House School</h2>
          <p className="mt-2 text-sm text-[#7c6f63]">Session {termInfo.session}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-dashed border-[#e5ddd2] bg-[#fdf7f0] px-4 py-3 text-sm text-[#7c6f63]">
            Missing receipts: {missingReceipts.length}
          </div>
          <button
            type="button"
            onClick={signOut}
            className="rounded-full border border-[#1f1b17] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#1f1b17]"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#1f1b17]">Quick actions</h3>
          <p className="text-sm text-[#7c6f63]">Add or search students without leaving the dashboard.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsStudentModalOpen(true)}
            className="rounded-full bg-[#1f1b17] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#fef7ed]"
          >
            Add student
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard label="Total expected income" value={formatCurrency(stats.totalExpected)} helper="Term fee + arrears" />
        <StatsCard label="Total revenue collected" value={formatCurrency(stats.totalCollected)} helper="All logged payments" />
        <StatsCard label="Total outstanding debt" value={formatCurrency(stats.totalOutstanding)} helper="Parents still owing" />
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
        onUnlockArrears={handleUnlockArrears}
        arrearsUnlocked={arrearsUnlocked}
        getLastPaymentDate={getLastPaymentDate}
        hideFinancialInputs
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
              className="rounded-full border border-[#1f1b17] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#1f1b17]"
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

      <InstallmentModal
        isOpen={Boolean(paymentStudent)}
        entity={paymentStudent}
        balance={paymentStudent ? getOutstanding(paymentStudent.id) : 0}
        onClose={() => setPaymentStudent(null)}
        onSubmit={handleLogPayment}
      />

      <AdminPinModal
        isOpen={isPinOpen}
        onClose={() => setIsPinOpen(false)}
        onVerify={handlePinVerify}
        allowBackdropClose
      />
    </section>
  )
}

export default Dashboard
