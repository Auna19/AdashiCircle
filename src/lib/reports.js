/**
 * @file Financial Statement & CSV/PDF Export Service (JavaScript)
 * Generates formatted CSV and PDF reports for savings circles and individual member statements.
 */

import Papa from 'papaparse'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { formatCurrency, koboToNaira } from '@/lib/utils/financial'
import { formatDate } from '@/lib/utils/dates'

/**
 * Exports group contributions to CSV
 */
export function exportGroupContributionsCSV(groupName, contributions) {
  const rows = (contributions || []).map((c) => ({
    'Circle': groupName,
    'Member': c.memberName || c.userEmail || 'Member',
    'Period': `Period #${c.periodNumber || 1}`,
    'Expected Amount (NGN)': (c.expectedAmountKobo / 100).toFixed(2),
    'Amount Paid (NGN)': (c.amountPaidKobo / 100).toFixed(2),
    'Payment Date': c.paymentDate || 'N/A',
    'Payment Method': c.paymentMethod || 'N/A',
    'Transaction Reference': c.transactionReference || 'N/A',
    'Status': c.status?.toUpperCase(),
  }))

  const csv = Papa.unparse(rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${groupName.replace(/\s+/g, '_')}_contributions_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Exports group contributions to a formatted PDF statement
 */
export function exportGroupContributionsPDF(groupName, contributions, summary = {}) {
  const doc = new jsPDF()

  // Header branding
  doc.setFillColor(5, 150, 105) // Emerald 600
  doc.rect(0, 0, 210, 30, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('AdashiCircle', 14, 18)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Digital Cooperative Savings Platform · Statement of Account', 14, 25)

  // Document details
  doc.setTextColor(30, 41, 59)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`Circle: ${groupName}`, 14, 42)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-NG', { dateStyle: 'long' })}`, 14, 48)
  if (summary.totalMembers) {
    doc.text(`Total Members: ${summary.totalMembers}   |   Confirmed Total: ${formatCurrency(summary.totalConfirmedKobo || 0)}`, 14, 54)
  }

  // Table
  const tableData = (contributions || []).map((c) => [
    `#${c.periodNumber || 1}`,
    c.memberName || c.userEmail || 'Member',
    formatCurrency(c.amountPaidKobo || c.expectedAmountKobo),
    c.paymentDate || '-',
    c.paymentMethod?.replace('_', ' ') || '-',
    c.status?.toUpperCase(),
  ])

  doc.autoTable({
    startY: 60,
    head: [['Period', 'Member', 'Amount', 'Date', 'Method', 'Status']],
    body: tableData,
    headStyles: {
      fillColor: [5, 150, 105],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  })

  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text(
      `Page ${i} of ${pageCount} — AdashiCircle Automated Financial Record`,
      14,
      doc.internal.pageSize.height - 10
    )
  }

  doc.save(`${groupName.replace(/\s+/g, '_')}_statement.pdf`)
}

/**
 * Exports individual member contribution statement
 */
export function exportMemberStatementPDF(memberName, userEmail, contributions, totalContributedKobo) {
  const doc = new jsPDF()

  // Header
  doc.setFillColor(5, 150, 105)
  doc.rect(0, 0, 210, 30, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('AdashiCircle', 14, 18)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Member Contribution Certificate & Financial Statement', 14, 25)

  // Member Information
  doc.setTextColor(30, 41, 59)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(`Member: ${memberName}`, 14, 42)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Email: ${userEmail}   |   Date Generated: ${new Date().toLocaleDateString('en-NG')}`, 14, 48)
  doc.text(`Total Confirmed Savings: ${formatCurrency(totalContributedKobo || 0)}`, 14, 54)

  const tableData = (contributions || []).map((c) => [
    c.groupName || 'Circle',
    `Period #${c.periodNumber || 1}`,
    formatCurrency(c.amountPaidKobo || 0),
    c.paymentDate || '-',
    c.status?.toUpperCase(),
  ])

  doc.autoTable({
    startY: 60,
    head: [['Circle Name', 'Period', 'Amount Paid', 'Date', 'Status']],
    body: tableData,
    headStyles: {
      fillColor: [5, 150, 105],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  })

  doc.save(`${memberName.replace(/\s+/g, '_')}_statement.pdf`)
}

