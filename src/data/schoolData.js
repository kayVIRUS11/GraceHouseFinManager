export const classLevels = ['JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3']

export const initialTerm = {
  session: '2026/2027',
  term: '1st Term'
}

export const initialFees = {
  'JSS 1': 200000,
  'JSS 2': 200000,
  'JSS 3': 200000,
  'SSS 1': 230000,
  'SSS 2': 230000,
  'SSS 3': 250000
}

export const initialStudents = [
  {
    id: 'stu_1',
    first_name: 'Alice',
    last_name: 'Smith',
    class_level: 'JSS 1',
    parent_name: 'Grace Smith',
    parent_whatsapp: '+2348012345678',
    adjusted_fee: 0,
    arrears: 15000
  },
  {
    id: 'stu_2',
    first_name: 'Bob',
    last_name: 'Jones',
    class_level: 'SSS 2',
    parent_name: 'Daniel Jones',
    parent_whatsapp: '+2348098765432',
    adjusted_fee: 180000,
    arrears: 0
  }
]

export const initialPayments = [
  {
    id: 'pay_1',
    student_id: 'stu_1',
    amount: 50000,
    method: 'transfer',
    date: '2026-05-12T10:00:00Z',
    receipt_number: 'GHS-0001',
    issued: false
  }
]
