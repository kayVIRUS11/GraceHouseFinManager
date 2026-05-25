import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export const exportNodeToPdf = async (node, filename) => {
  if (!node) return
  const canvas = await html2canvas(node, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#f6f3ee'
  })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'pt', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imgWidth = pageWidth
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  let position = 0
  let remaining = imgHeight

  while (remaining > 0) {
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    remaining -= pageHeight
    if (remaining > 0) {
      pdf.addPage()
      position -= pageHeight
    }
  }

  pdf.save(filename)
}
