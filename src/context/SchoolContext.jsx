import { useEffect, useMemo, useState } from 'react'
import {
  classLevels,
  initialFees,
  initialPayments,
  initialStudents,
  initialTerm
} from '../data/schoolData.js'
import { loadState, saveLastSync, saveState } from '../utils/storage.js'
import { getDeviceId, pullOps, pushOps, queueOp } from '../utils/syncEngine.js'
import { SchoolContext } from './school-context.js'

const getNextReceipt = (index) => `GHS-${String(index).padStart(4, '0')}`
const toNumber = (value) => Number(value || 0)

const getStudentFee = (student, feeMap) => {
  const baseFee = feeMap[student.class_level] || 0
  return toNumber(student.adjusted_fee) > 0 ? toNumber(student.adjusted_fee) : toNumber(baseFee)
}

const getOutstandingForStudent = (student, feeMap, paymentRecords) => {
  const totalPaid = paymentRecords
    .filter((payment) => payment.student_id === student.id)
    .reduce((acc, payment) => acc + toNumber(payment.amount), 0)
  return getStudentFee(student, feeMap) + toNumber(student.arrears) - totalPaid
}

const promoteStudentRecords = (studentRecords, feeMap, paymentRecords) =>
  studentRecords.map((student) => {
    const currentIndex = classLevels.indexOf(student.class_level)
    const nextClass =
      currentIndex >= 0 && currentIndex < classLevels.length - 1
        ? classLevels[currentIndex + 1]
        : student.class_level
    const outstanding = getOutstandingForStudent(student, feeMap, paymentRecords)
    return {
      ...student,
      class_level: nextClass,
      arrears: Math.max(outstanding, 0),
      adjusted_fee: 0
    }
  })

const parseReceiptIndex = (receiptNumber) => {
  const match = String(receiptNumber || '').match(/^GHS-(\d+)$/)
  if (!match) return null
  return Number(match[1])
}

export const SchoolProvider = ({ children }) => {
  const [students, setStudents] = useState(initialStudents)
  const [fees, setFees] = useState(initialFees)
  const [payments, setPayments] = useState(initialPayments)
  const [termInfo, setTermInfo] = useState(initialTerm)
  const [receiptIndex, setReceiptIndex] = useState(initialPayments.length + 1)
  const [isHydrated, setIsHydrated] = useState(false)
  const [syncStatus, setSyncStatus] = useState('idle')
  const [lastSyncAt, setLastSyncAt] = useState(null)
  const [syncError, setSyncError] = useState(null)

  const getAdjustedFee = (student) => {
    return getStudentFee(student, fees)
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
    return getOutstandingForStudent(student, fees, payments)
  }

  const addStudent = (studentData) => {
    const newStudent = {
      ...studentData,
      id: `stu_${crypto.randomUUID()}`,
      adjusted_fee: toNumber(studentData.adjusted_fee),
      arrears: toNumber(studentData.arrears)
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
      id: `pay_${crypto.randomUUID()}`,
      student_id: studentId,
      amount: toNumber(amount),
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
      [classLevel]: toNumber(amount)
    }))
    queueOp('update_fee', { classLevel, amount: toNumber(amount) })
  }

  const updateTermInfo = (nextTerm) => {
    setTermInfo(nextTerm)
    queueOp('update_term', nextTerm)
  }

  const promoteStudents = () => {
    setStudents((prev) => promoteStudentRecords(prev, fees, payments))
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
        const nextReceiptIndex = Number(stored.receiptIndex)
        setReceiptIndex(nextReceiptIndex > 0 ? nextReceiptIndex : initialPayments.length + 1)
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
      lastSyncAt
    })
  }, [students, fees, payments, termInfo, receiptIndex, lastSyncAt, isHydrated])

  const applyRemoteOp = (op) => {
    if (op.device_id === getDeviceId()) {
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
      const parsedReceipt = parseReceiptIndex(op.payload.receipt_number)
      if (parsedReceipt) {
        setReceiptIndex((prev) => Math.max(prev, parsedReceipt + 1))
      }
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
      setStudents((prev) => promoteStudentRecords(prev, fees, payments))
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
      setSyncError(`Sync failed: ${error.message || 'Unknown error'}. Retrying in 60 seconds.`)
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
    promoteStudents,
    getAdjustedFee,
    getTotalPaid,
    getLastPaymentDate,
    getOutstanding,
    missingReceipts
  }

  return <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>
}
