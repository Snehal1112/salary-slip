import React, { useRef } from 'react'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { setEmployee, setIncome, setDeductions, setWorkingDays, setMonth, recalc, saveSlip } from '../features/salary/salarySlice'
import { Container, Typography, Paper, Box, Table, TableBody, TableCell, TableHead, TableRow, Button } from '@mui/material'
import PageBreadcrumbs from '../components/PageBreadcrumbs'
import { formatCurrency } from '../utils/currency'
import { estimateAnnualTax, annualToMonthly } from '../utils/tax'
import { computeProfessionalTax } from '../utils/professionalTax'

// We'll try to use html2canvas + jsPDF if available for PDF export, otherwise fallback to print

const PreviewPage: React.FC = () => {
  const current = useAppSelector((s) => s.salary.current)
  const dispatch = useAppDispatch()
  const ref = useRef<HTMLDivElement | null>(null)

  const fmt = (v: number | string | undefined | null) => {
    const n = Number(v ?? 0)
    return formatCurrency(Number.isFinite(n) ? n : 0)
  }

  return (
    <Container sx={{ py: 2 }}>
      <PageBreadcrumbs />
      <Paper sx={{ p: 1 }} ref={ref} className="print-area">
        <div className="salary-slip">
          <div className="header">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div className="company">
                {current.template?.showCompanyName !== false && (
                  <Typography variant="h6" sx={{ fontWeight: 800 }} className="company-name">{current.company.name}</Typography>
                )}
                {current.template?.showCompanyAddress !== false && current.company.address && (
                  <Typography variant="body2" sx={{ mt: 0.5 }} className="company-address">{current.company.address}</Typography>
                )}
              </div>
            </div>
            <div className="meta" style={{ textAlign: current.template?.titleAlign ?? 'right' }}>
              <div className="meta-box">
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }} className="meta-title">{current.template?.titleText ?? 'PAYSLIP'}</Typography>
                <Typography variant="body2" className="meta-date">{current.month}</Typography>
              </div>
            </div>
          </div>

          <Box sx={{ display: 'flex', gap: 2, mt: 1.5, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1 }}>
              <Table size="small" className="info-table">
                <TableBody>
                  <TableRow>
                    <TableCell className="label">Employee Name</TableCell>
                    <TableCell className="value">{current.employee.name}</TableCell>
                    <TableCell className="label right">Total Working Days</TableCell>
                    <TableCell className="value right">{current.workingDays?.totalWorkingDays ?? '-'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="label">Employee Code</TableCell>
                    <TableCell className="value">{current.employee.code}</TableCell>
                    <TableCell className="label right">Number of Working Days Attended</TableCell>
                    <TableCell className="value right">{current.workingDays?.daysAttended ?? '-'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="label">Designation</TableCell>
                    <TableCell className="value">{current.employee.designation}</TableCell>
                    <TableCell className="label right">Leaves</TableCell>
                    <TableCell className="value right">{current.workingDays?.leavesTaken ? '' : ''}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="label">PAN</TableCell>
                    <TableCell className="value">{current.employee.pan}</TableCell>
                    <TableCell className="label right">Leaves Taken</TableCell>
                    <TableCell className="value right">{current.workingDays?.leavesTaken ?? '0'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="label">Bank Account Number</TableCell>
                    <TableCell className="value">{current.employee.bankAccount}</TableCell>
                    <TableCell className="label right">Balance Leaves</TableCell>
                    <TableCell className="value right">{current.workingDays?.balanceLeaves ?? '0'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="label">Bank Name</TableCell>
                    <TableCell className="value">{current.employee.bankName}</TableCell>
                    <TableCell className="label right">Cheque Number</TableCell>
                    <TableCell className="value right">{current.employee.chequeNumber}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Box>

          <Box sx={{ mt: 1.5 }}>
            <Table size="small" className="earnings-deductions">
              <TableHead>
                <TableRow>
                  <TableCell colSpan={2} sx={{ fontWeight: 700 }}>Earnings</TableCell>
                  <TableCell colSpan={2} sx={{ fontWeight: 700 }}>Deductions</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Particulars</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Particulars</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(() => {
                  const left = current.income || []
                  const right = current.deductions || []
                  const max = Math.max(left.length, right.length)
                  const rows = [] as React.ReactNode[]
                  for (let i = 0; i < max; i++) {
                    const l = left[i]
                    const r = right[i]
                    rows.push(
                      <TableRow key={i}>
                        <TableCell>{l ? l.particular : ''}</TableCell>
                        <TableCell align="right">{l ? fmt(l.amount) : ''}</TableCell>
                        <TableCell>{r ? r.particular : ''}</TableCell>
                        <TableCell align="right">{r ? fmt(r.amount) : ''}</TableCell>
                      </TableRow>
                    )
                  }
                  return rows
                })()}
                <TableRow className="total-row">
                  <TableCell sx={{ fontWeight: 700 }}>Total Earnings</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{fmt(current.totalIncome)}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Total Deductions</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{fmt(current.totalDeductions)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>

          <Box sx={{ mt: 1.5 }} className="totals">
            <div className="net-salary">
              <div className="net-block">
                <Typography variant="caption" className="net-label">Net Salary</Typography>
                <Typography variant="h4" className="net-amount">{fmt(current.netSalary)}</Typography>
              </div>
            </div>
          </Box>

          <div className="signature">
            <div className="sig-box">
              <div className="line" />
              <div className="label">Employee Signature</div>
            </div>
            <div className="sig-box">
              <div className="line" />
              <div className="label">Authorised Signatory</div>
            </div>
          </div>
        </div>

        <Box sx={{ mt: 2, p: 2 }}>
          <Button variant="contained" onClick={async () => {
            if (!ref.current) return
            try {
              const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')])
              const canvas = await html2canvas(ref.current as HTMLElement, { scale: 2 })
              const imgData = canvas.toDataURL('image/png')
              const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
              const pageWidth = pdf.internal.pageSize.getWidth()
              const pageHeight = pdf.internal.pageSize.getHeight()
              const imgProps = { width: canvas.width, height: canvas.height }
              const ratio = Math.min(pageWidth / imgProps.width, pageHeight / imgProps.height)
              pdf.addImage(imgData, 'PNG', 0, 0, imgProps.width * ratio, imgProps.height * ratio)
              pdf.save('salary-slip.pdf')
            } catch {
              window.print()
            }
          }}>Export PDF / Print</Button>
          <Button sx={{ ml: 2 }} variant="outlined" component="a" href="/form">Edit</Button>
          <Button sx={{ ml: 2 }} variant="outlined" onClick={() => {
            // sample for gross 100,890
            const gross = 100890
            const basic = Math.round(gross * 0.5)
            const hra = Math.round(basic * 0.4)
            const conveyance = 1600
            const medical = 1250
            const special = gross - (basic + hra + conveyance + medical)
            const income = [
              { particular: 'Basic Salary', amount: basic },
              { particular: 'HRA', amount: hra },
              { particular: 'Conveyance', amount: conveyance },
              { particular: 'Medical Allowance', amount: medical },
              { particular: 'Special Allowance', amount: special },
            ]
            const employeePF = Math.round(basic * 0.12)
            const employerPF = Math.round(basic * 0.12)
            // professional tax using helper
            const professionalTax = computeProfessionalTax('Gujarat', gross)
            // ESI: applicable for gross <= 21000 (employee 0.75%, employer 3.25%)
            const esiThreshold = 21000
            const esiEmployee = gross <= esiThreshold ? Math.round(gross * 0.0075) : 0
            const esiEmployer = gross <= esiThreshold ? Math.round(gross * 0.0325) : 0
            // estimate annual taxable income: annual gross - standard deduction - employee PF*12
            const annualGross = gross * 12
            const stdDeduction = 50000
            const annualEmployeePF = employeePF * 12
            const annualTaxable = Math.max(0, annualGross - stdDeduction - annualEmployeePF)
            const annualTax = estimateAnnualTax(annualTaxable, 'old')
            const estTDS = annualToMonthly(annualTax)
            const deductions = [
              { particular: 'PF', amount: employeePF },
              ...(esiEmployee ? [{ particular: 'ESI', amount: esiEmployee }] : []),
              { particular: 'Professional Tax', amount: professionalTax },
              { particular: 'TDS', amount: estTDS },
            ]

            dispatch(setEmployee({
              name: 'Sample Employee',
              code: 'EMP12345',
              designation: 'Software Engineer',
              pan: 'XXXXX1234X',
              bankAccount: '************1234',
              bankName: 'Sample Bank',
              chequeNumber: '',
            }))
            dispatch(setIncome(income))
            dispatch(setDeductions(deductions))
            // Also set employer-side contributions in a readable place by appending to income as 'Employer Contribution' lines (read-only)
            const employerContrib = [
              { particular: 'Employer PF (12%)', amount: employerPF },
              ...(esiEmployer ? [{ particular: 'Employer ESI (3.25%)', amount: esiEmployer }] : []),
            ]
            // append employer contributions as additional income rows labelled 'Employer Contribution' (display-only)
            dispatch(setIncome([...income, ...employerContrib]))
            dispatch(setWorkingDays({ totalWorkingDays: 30, daysAttended: 30, leavesTaken: 0, balanceLeaves: 12 }))
            dispatch(setMonth('Aug-25'))
            dispatch(recalc())
            dispatch(saveSlip())
          }}>Load sample slip</Button>
        </Box>
      </Paper>
    </Container>
  )
}

export default PreviewPage
