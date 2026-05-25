import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  classLevels,
  initialFees,
  initialPayments,
  initialStudents,
  initialTerm
} from '../data/schoolData.js'
import { loadState, saveLastSync, saveState } from '../utils/storage.js'
import { pullOps, pushOps, queueOp } from '../utils/syncEngine.js'

const SchoolContext = createContext()

const getNextReceipt = (index) => `GHS-${String(index).padStart(4, '0')}`

export const SchoolProvider = ({ children }) => {
  const [students, setStudents] = useState(initialStudents)
  const [fees, setFees] = useState(initialFees)
  const [payments, setPayments] = useState(initialPayments)
  const [termInfo, setTermInfo] = useState(initialTerm)
  const [receiptIndex, setReceiptIndex] = useState(initialPayments.length + 1)
  const [adminPin, setAdminPin] = useState('1234')
  const [adminUnlocked, setAdminUnlocked] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [syncStatus, setSyncStatus] = useState('idle')
  const [lastSyncAt, setLastSyncAt] = useState(null)
  const [syncError, setSyncError] = useState(null)

  const getAdjustedFee = (student) => {
    const baseFee = fees[student.class_level] || 0
    return student.adjusted_fee > 0 ? student.adjusted_fee : baseFee
  }

  const getTotalPaid = (studentId) =>
    payments
      .filter((payment) => payment.student_id === studentId)
      .reduce((acc, payment) => acc + Number(payment.amount || 0), 0)

  const getLastPaymentDate = (studentId) => {
    const studentPayments = payments
      .filter((payment) => payment.student_id === studentId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
    return studentPayments[0]?.date || ''
  }

  const getOutstanding = (studentId) => {
    const student = students.find((entry) => entry.id === studentId)
    if (!student) return 0
    const fee = getAdjustedFee(student)
    const totalPaid = getTotalPaid(studentId)
    return fee + Number(student.arrears || 0) - totalPaid
  }

  const addStudent = (studentData) => {
    const newStudent = {
      ...studentData,
      id: `stu_${Date.now()}`,
      adjusted_fee: Number(studentData.adjusted_fee || 0),
      arrears: Number(studentData.arrears || 0)
    }
    setStudents((prev) => [
      ...prev,
      newStudent
    ])
    queueOp('add_student', newStudent)
  }

  const updateStudent = (studentId, updates) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId
          ? {
              ...student,
              ...updates
            }
          : student
      )
    )
    queueOp('update_student', { studentId, updates })
  }

  const logPayment = ({ studentId, amount, method }) => {
    const receiptNumber = getNextReceipt(receiptIndex)
    const newPayment = {
      id: `pay_${Date.now()}`,
      student_id: studentId,
      amount: Number(amount),
      method,
      date: new Date().toISOString(),
      receipt_number: receiptNumber,
      issued: false
    }

    setPayments((prev) => [...prev, newPayment])
    setReceiptIndex((prev) => prev + 1)
    queueOp('log_payment', newPayment)
    return newPayment
  }

  const issueReceipt = (paymentId) => {
    setPayments((prev) =>
      prev.map((payment) =>
        payment.id === paymentId
          ? {
              ...payment,
              issued: true
            }
          : payment
      )
    )
    queueOp('issue_receipt', { paymentId })
  }

  const updateFee = (classLevel, amount) => {
    setFees((prev) => ({
      ...prev,
      [classLevel]: Number(amount)
    }))
    queueOp('update_fee', { classLevel, amount: Number(amount) })
  }

  const updateTermInfo = (nextTerm) => {
    setTermInfo(nextTerm)
    queueOp('update_term', nextTerm)
  }

  const verifyAdminPin = (pin) => {
    const isValid = pin === adminPin
    if (isValid) {
      setAdminUnlocked(true)
    }
    return isValid
  }

  const lockAdmin = () => {
    setAdminUnlocked(false)
  }

  const changeAdminPin = (nextPin) => {
    setAdminPin(nextPin)
  }

  const promoteStudents = () => {
    setStudents((prev) =>
      prev.map((student) => {
        const currentIndex = classLevels.indexOf(student.class_level)
        const nextClass =
          currentIndex >= 0 && currentIndex < classLevels.length - 1
            ? classLevels[currentIndex + 1]
            : student.class_level
        const outstanding = getOutstanding(student.id)
        return {
          ...student,
          class_level: nextClass,
          arrears: Math.max(outstanding, 0),
          adjusted_fee: 0
        }
      })
    )
    setPayments([])
    setReceiptIndex(1)
    queueOp('promote_students', { at: new Date().toISOString() })
  }

  useEffect(() => {
    let isMounted = true
    loadState()
      .then((stored) => {
        if (!stored || !isMounted) return
        setStudents(stored.students || initialStudents)
        setFees(stored.fees || initialFees)
        setPayments(stored.payments || initialPayments)
        setTermInfo(stored.termInfo || initialTerm)
        setReceiptIndex(stored.receiptIndex || initialPayments.length + 1)
        setAdminPin(stored.adminPin || '1234')
        setLastSyncAt(stored.lastSyncAt || null)
      })
      .finally(() => {
        if (isMounted) setIsHydrated(true)
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    saveState({
      students,
      fees,
      payments,
      termInfo,
      receiptIndex,
      adminPin,
      lastSyncAt
    })
  }, [students, fees, payments, termInfo, receiptIndex, adminPin, lastSyncAt, isHydrated])

  const applyRemoteOp = (op) => {
    if (op.device_id === localStorage.getItem('device_id')) {
      return
    }
    if (op.type === 'add_student') {
      setStudents((prev) => {
        if (prev.some((student) => student.id === op.payload.id)) return prev
        return [...prev, op.payload]
      })
      return
    }
    if (op.type === 'update_student') {
      setStudents((prev) =>
        prev.map((student) =>
          student.id === op.payload.studentId
            ? { ...student, ...op.payload.updates }
            : student
        )
      )
      return
    }
    if (op.type === 'log_payment') {
      setPayments((prev) => {
        if (prev.some((payment) => payment.id === op.payload.id)) return prev
        return [...prev, op.payload]
      })
      return
    }
    if (op.type === 'issue_receipt') {
      setPayments((prev) =>
        prev.map((payment) =>
          payment.id === op.payload.paymentId ? { ...payment, issued: true } : payment
        )
      )
      return
    }
    if (op.type === 'update_fee') {
      setFees((prev) => ({ ...prev, [op.payload.classLevel]: op.payload.amount }))
      return
    }
    if (op.type === 'update_term') {
      setTermInfo(op.payload)
      return
    }
    if (op.type === 'promote_students') {
      setStudents((prev) =>
        prev.map((student) => {
          const currentIndex = classLevels.indexOf(student.class_level)
          const nextClass =
            currentIndex >= 0 && currentIndex < classLevels.length - 1
              ? classLevels[currentIndex + 1]
              : student.class_level
          return {
            ...student,
            class_level: nextClass,
            arrears: Number(student.arrears || 0),
            adjusted_fee: 0
          }
        })
      )
      setPayments([])
      setReceiptIndex(1)
    }
  }

  const syncNow = async () => {
    try {
      setSyncStatus('syncing')
      setSyncError(null)
      await pushOps()
      const result = await pullOps(applyRemoteOp)
      const timestamp = new Date().toISOString()
      setLastSyncAt(timestamp)
      await saveLastSync(timestamp)
      setSyncStatus('up_to_date')
      return result
    } catch (error) {
      setSyncStatus('error')
      setSyncError('Sync failed. Retrying in 60 seconds.')
      return { error }
    }
  }

  const missingReceipts = useMemo(
    () => payments.filter((payment) => !payment.issued),
    [payments]
  )

  const value = {
    students,
    fees,
    payments,
    termInfo,
    classLevels,
    adminUnlocked,
    isHydrated,
    syncStatus,
    syncError,
    lastSyncAt,
    syncNow,
    addStudent,
    updateStudent,
    logPayment,
    issueReceipt,
    updateFee,
    updateTermInfo,
    verifyAdminPin,
    lockAdmin,
    changeAdminPin,
    promoteStudents,
    getAdjustedFee,
    getTotalPaid,
    getLastPaymentDate,
    getOutstanding,
    missingReceipts
  }

  return <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>
}

export const useSchool = () => useContext(SchoolContext)
