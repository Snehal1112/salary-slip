import React, { useRef, useMemo, useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { setEmployee, setIncome, setDeductions, setWorkingDays, setMonth, recalc, saveSlip } from '../features/salary/salarySlice'
import { Container, Paper, Box, Button, Typography } from '@mui/material'
import PageBreadcrumbs from '../components/PageBreadcrumbs'
import CompanyHeader from '../components/CompanyHeader'
import EmployeeInfoTable from '../components/EmployeeInfoTable'
import EarningsDeductionsTable from '../components/EarningsDeductionsTable'
import NetSalarySection from '../components/NetSalarySection'
import { formatCurrency } from '../utils/currency'
import { estimateAnnualTax, annualToMonthly } from '../utils/tax'
import { computeProfessionalTax } from '../utils/professionalTax'

// Custom hook for PDF functionality
const usePDFExport = (ref: React.RefObject<HTMLDivElement | null>) => {
  return useCallback(async () => {
    if (!ref.current) return
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ])

      // Higher quality canvas settings
      const canvas = await html2canvas(ref.current as HTMLElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        removeContainer: true
      })

      const imgData = canvas.toDataURL('image/png', 1.0)
      const pdf = new jsPDF({
        unit: 'pt',
        format: 'a4',
        orientation: 'portrait'
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgProps = { width: canvas.width, height: canvas.height }

      // Calculate scaling to fit page with margins
      const margin = 40
      const availableWidth = pageWidth - (margin * 2)
      const availableHeight = pageHeight - (margin * 2)

      const ratio = Math.min(
        availableWidth / imgProps.width,
        availableHeight / imgProps.height
      )

      const scaledWidth = imgProps.width * ratio
      const scaledHeight = imgProps.height * ratio

      // Center the content
      const x = (pageWidth - scaledWidth) / 2
      const y = (pageHeight - scaledHeight) / 2

      pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight)

      // Generate filename with current date
      const now = new Date()
      const filename = `salary-slip-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.pdf`

      pdf.save(filename)
    } catch (error) {
      console.warn('PDF export failed, falling back to print:', error)
      window.print()
    }
  }, [ref])
}

const PreviewPage: React.FC = React.memo(() => {
  const current = useAppSelector((s) => s.salary.current)
  const dispatch = useAppDispatch()
  const ref = useRef<HTMLDivElement | null>(null)

  const exportToPDF = usePDFExport(ref)

  // Memoized formatter function
  const fmt = useCallback((v: number | string | undefined | null) => {
    const n = Number(v ?? 0)
    return formatCurrency(Number.isFinite(n) ? n : 0)
  }, [])

  // Memoized formatted values
  const formattedValues = useMemo(() => ({
    totalIncome: fmt(current.totalIncome),
    totalDeductions: fmt(current.totalDeductions),
    netSalary: fmt(current.netSalary)
  }), [current.totalIncome, current.totalDeductions, current.netSalary, fmt])

  // Memoized sample data handler
  const handleLoadSample = useCallback(() => {
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
    const professionalTax = computeProfessionalTax('Gujarat', gross)
    const esiThreshold = 21000
    const esiEmployee = gross <= esiThreshold ? Math.round(gross * 0.0075) : 0
    const esiEmployer = gross <= esiThreshold ? Math.round(gross * 0.0325) : 0
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
    const employerContrib = [
      { particular: 'Employer PF (12%)', amount: employerPF },
      ...(esiEmployer ? [{ particular: 'Employer ESI (3.25%)', amount: esiEmployer }] : []),
    ]
    dispatch(setIncome([...income, ...employerContrib]))
    dispatch(setWorkingDays({ totalWorkingDays: 30, daysAttended: 30, leavesTaken: 0, balanceLeaves: 12 }))
    dispatch(setMonth('Aug-25'))
    dispatch(recalc())
    dispatch(saveSlip())
  }, [dispatch])

  return (
    <Container maxWidth={false} sx={{ py: 3, px: { xs: 1, sm: 2 } }}>
      <PageBreadcrumbs />
      <Paper sx={{
        p: { xs: 2, sm: 3, md: 4 },
        width: { xs: '100%' },
        minWidth: { sm: '210mm' },
        mx: 'auto',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        bgcolor: '#ffffff'
      }} className="print-area">
        <div className="salary-slip" ref={ref}>

          {/* Company Header */}
          <CompanyHeader
            company={current.company}
            template={current.template}
            month={current.month}
          />

          {/* Employee Information */}
          <EmployeeInfoTable
            employee={current.employee}
            workingDays={current.workingDays}
          />

          {/* Earnings and Deductions */}
          <EarningsDeductionsTable
            income={current.income || []}
            deductions={current.deductions || []}
            totalIncome={formattedValues.totalIncome}
            totalDeductions={formattedValues.totalDeductions}
            formatCurrency={fmt}
          />

          {/* Net Salary */}
          <NetSalarySection netSalary={formattedValues.netSalary} />

          {/* Signature Section */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mt: 6,
            pt: 4,
            borderTop: '1px solid',
            borderColor: 'grey.400'
          }}>
            <Box sx={{ flex: 1, textAlign: 'center', px: 2 }}>
              <Box sx={{
                height: '80px',
                borderBottom: '2px dashed',
                borderColor: 'grey.400',
                mb: 2,
                position: 'relative'
              }}>
                <Typography variant="caption" sx={{
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bgcolor: 'background.paper',
                  px: 1,
                  color: 'grey.600'
                }}>
                  Signature Space
                </Typography>
              </Box>
              <Typography variant="subtitle1" sx={{
                fontWeight: 500,
                color: 'grey.700',
                mt: 2,
                fontSize: '1rem'
              }}>
                Employee Signature
              </Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'center', px: 2 }}>
              <Box sx={{
                height: '80px',
                borderBottom: '2px dashed',
                borderColor: 'grey.400',
                mb: 2,
                position: 'relative'
              }}>
                <Typography variant="caption" sx={{
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bgcolor: 'background.paper',
                  px: 1,
                  color: 'grey.600'
                }}>
                  Signature Space
                </Typography>
              </Box>
              <Typography variant="subtitle1" sx={{
                fontWeight: 500,
                color: 'grey.700',
                mt: 2,
                fontSize: '1rem'
              }}>
                Authorized Signatory
              </Typography>
            </Box>
          </Box>

          {/* Disclaimer */}
          <Box sx={{
            textAlign: 'center',
            mt: 4,
            pt: 3,
            borderTop: '1px solid',
            borderColor: 'grey.200'
          }}>
            <Typography variant="body2" sx={{
              color: 'grey.500',
              fontStyle: 'normal',
              fontWeight: 400,
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6,
              fontSize: '0.875rem'
            }}>
              <Box component="span" sx={{ fontWeight: 600, color: 'grey.700' }}>Disclaimer:</Box> This salary slip is system generated and does not require a physical signature.
              All information is confidential and intended solely for the recipient.
            </Typography>
          </Box>
        </div>

        {/* Action Buttons */}
        <Box sx={{
          mt: 4,
          p: 3,
          bgcolor: 'grey.50',
          borderRadius: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Button
            variant="contained"
            onClick={exportToPDF}
            size="large"
            sx={{
              minWidth: { xs: '100%', sm: 140 },
              fontWeight: 600,
              py: 1.5,
              fontSize: '0.95rem'
            }}
          >
            Export PDF / Print
          </Button>
          <Button
            sx={{ minWidth: { xs: '100%', sm: 120 } }}
            variant="outlined"
            component="a"
            href="/form"
            size="large"
          >
            Edit Slip
          </Button>
          <Button
            sx={{ minWidth: { xs: '100%', sm: 140 } }}
            variant="text"
            onClick={handleLoadSample}
            size="large"
          >
            Load Sample
          </Button>
        </Box>
      </Paper>
    </Container>
  )
})

PreviewPage.displayName = 'PreviewPage'

export default PreviewPage
