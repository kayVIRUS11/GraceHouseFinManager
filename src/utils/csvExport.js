const escapeCsvValue = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`

const buildCsvContent = (header, rows) =>
  [header, ...rows].map((row) => row.map((value) => escapeCsvValue(value)).join(',')).join('\n')

export const downloadCsv = (filename, header, rows) => {
  if (!rows || rows.length === 0) return false
  const csv = buildCsvContent(header, rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
  return true
}
