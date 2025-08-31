import React, { useRef, useMemo, useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { setEmployee, setIncome, setDeductions, setWorkingDays, setMonth, recalc, saveSlip } from '../features/salary/salarySlice'
import { Container, Typography, Paper, Box, Table, TableBody, TableCell, TableHead, TableRow, Button } from '@mui/material'
import PageBreadcrumbs from '../components/PageBreadcrumbs'
import { formatCurrency } from '../utils/currency'
import { estimateAnnualTax, annualToMonthly } from '../utils/tax'
import { computeProfessionalTax } from '../utils/professionalTax'

// Static style objects to prevent recreation on each render
const headerBoxStyles = {
  borderBottom: '2px solid',
  borderColor: 'grey.400',
  pb: { xs: 3, md: 4 },
  mb: { xs: 4, md: 5 },
  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
  p: { xs: 3, sm: 3.5, md: 4 },
  borderRadius: 2,
  boxShadow: '3px 3px 8px rgba(0,0,0,0.08)'
}

const employeeInfoStyles = {
  mb: { xs: 4, md: 5 }
}

const netSalaryStyles = {
  textAlign: 'center',
  my: 4,
  p: { xs: 3, md: 4 },
  bgcolor: '#ffffff',
  borderRadius: 1,
  border: '1px solid',
  borderColor: 'grey.200',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  transition: 'all 0.2s ease-in-out',
}

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

  // Memoized processed company name
  const processedCompanyName = useMemo(() => {
    if (typeof current.company.name === 'string') {
      return current.company.name.replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ').replace(/\n/g, ' ').trim()
    }
    return current.company.name
  }, [current.company.name])

  // Memoized processed company address
  const processedCompanyAddress = useMemo(() => {
    if (!current.company.address) return null

    if (Array.isArray(current.company.address)) {
      return current.company.address.map((line: string, idx: number) => ({
        key: idx,
        text: line
      }))
    }

    return String(current.company.address)
      .split(/,|\n/)
      .map((line: string, idx: number) => ({
        key: idx,
        text: line.trim()
      }))
  }, [current.company.address])

  // Memoized formatted values
  const formattedValues = useMemo(() => ({
    totalIncome: fmt(current.totalIncome),
    totalDeductions: fmt(current.totalDeductions),
    netSalary: fmt(current.netSalary)
  }), [current.totalIncome, current.totalDeductions, current.netSalary, fmt])

  // Memoized table rows for earnings and deductions
  const tableRows = useMemo(() => {
    const left = current.income || []
    const right = current.deductions || []
    const max = Math.max(left.length, right.length)
    const rows = [] as React.ReactNode[]

    for (let i = 0; i < max; i++) {
      const l = left[i]
      const r = right[i]
      rows.push(
        <TableRow
          key={i}
          sx={{
            '&:nth-of-type(odd)': { bgcolor: 'grey.50' },
            '&:hover': { bgcolor: 'grey.100' }
          }}
        >
          <TableCell sx={{ fontWeight: 400, color: l ? 'grey.700' : 'transparent' }}>
            {l ? l.particular : ''}
          </TableCell>
          <TableCell align="right" sx={{ fontWeight: 500, color: l ? 'grey.800' : 'transparent' }}>
            {l ? fmt(l.amount) : ''}
          </TableCell>
          <TableCell sx={{ fontWeight: 400, color: r ? 'grey.700' : 'transparent' }}>
            {r ? r.particular : ''}
          </TableCell>
          <TableCell align="right" sx={{ fontWeight: 500, color: r ? 'grey.800' : 'transparent' }}>
            {r ? fmt(r.amount) : ''}
          </TableCell>
        </TableRow>
      )
    }
    return rows
  }, [current.income, current.deductions, fmt])

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
        width: { xs: '100%', sm: '210mm' },
        minWidth: { sm: '210mm' },
        mx: 'auto',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        bgcolor: '#ffffff'
      }} className="print-area">
        <div className="salary-slip" ref={ref}>
          {/* Header Section with Company Info */}
          <Box sx={headerBoxStyles}>
            <div className="header">
              <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'center', sm: 'flex-start' },
                gap: { xs: 2, sm: 1 }
              }}>
                <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                  {current.template?.showCompanyName !== false && (
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        letterSpacing: 0.3,
                        color: 'grey.800',
                        mb: { xs: 2, md: 2.5 },
                        fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                        lineHeight: 1.2
                      }}
                      className="company-name"
                    >
                      {processedCompanyName}
                    </Typography>
                  )}
                  <Box sx={{ mt: 1, mb: { xs: 1.5, md: 2 } }}>
                    {current.template?.showCompanyAddress !== false && current.company.address && (
                      <Box sx={{ mb: 1 }}>
                        {processedCompanyAddress && (
                          Array.isArray(processedCompanyAddress)
                            ? processedCompanyAddress.map(({ key, text }) => (
                              <Typography key={key} variant="body1" sx={{
                                color: 'grey.600',
                                lineHeight: 1.6,
                                fontWeight: 400,
                                fontSize: { xs: '0.9rem', md: '1rem' }
                              }}>
                                {text}
                              </Typography>
                            ))
                            : processedCompanyAddress
                        )}
                      </Box>
                    )}
                    {/* Company Details in a clean grid */}
                    <Box sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      flexWrap: 'wrap',
                      gap: { xs: 0.5, sm: 2 },
                      mt: 2
                    }}>
                      {current.company.gstin && (
                        <Typography variant="body2" sx={{
                          color: 'grey.500',
                          fontWeight: 400,
                          fontSize: { xs: '0.8rem', md: '0.875rem' }
                        }}>
                          <Box component="span" sx={{ fontWeight: 600, color: 'grey.700' }}>GSTIN:</Box> {current.company.gstin}
                        </Typography>
                      )}
                      {current.company.email && (
                        <Typography variant="body2" sx={{
                          color: 'grey.500',
                          fontWeight: 400,
                          fontSize: { xs: '0.8rem', md: '0.875rem' }
                        }}>
                          <Box component="span" sx={{ fontWeight: 600, color: 'grey.700' }}>Email:</Box> {current.company.email}
                        </Typography>
                      )}
                      {current.company.website && (
                        <Typography variant="body2" sx={{
                          color: 'grey.500',
                          fontWeight: 400,
                          fontSize: { xs: '0.8rem', md: '0.875rem' }
                        }}>
                          <Box component="span" sx={{ fontWeight: 600, color: 'grey.700' }}>Website:</Box> {current.company.website}
                        </Typography>
                      )}
                      {(current.company.mobile || current.company.contactNumber) && (
                        <Typography variant="body2" sx={{
                          color: 'grey.500',
                          fontWeight: 400,
                          fontSize: { xs: '0.8rem', md: '0.875rem' }
                        }}>
                          <Box component="span" sx={{ fontWeight: 600, color: 'grey.700' }}>Contact:</Box> {current.company.mobile || current.company.contactNumber}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
                <Box sx={{
                  textAlign: 'center',
                  bgcolor: '#ffffff',
                  color: 'grey.800',
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 2,
                  minWidth: { xs: 140, md: 160 },
                  alignSelf: { xs: 'center', sm: 'flex-start' },
                  border: '1px solid',
                  borderColor: 'grey.200',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease-in-out',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: '#6c757d'
                  },
                  '&:hover': {
                    borderColor: 'grey.300',
                    transform: 'translateY(-1px)'
                  }
                }}>
                  <Typography variant="h6" sx={{
                    fontWeight: 600,
                    mb: 0.5,
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    letterSpacing: 0.5
                  }}>
                    {current.template?.titleText || 'PAYSLIP'}
                  </Typography>
                  <Typography variant="body2" sx={{
                    opacity: 0.85,
                    fontSize: { xs: '0.8rem', md: '0.875rem' },
                    fontWeight: 400
                  }}>
                    {current.month || new Date().toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                  </Typography>
                </Box>
              </Box>
            </div>
          </Box>

          {/* Employee Information Section */}
          <Box sx={employeeInfoStyles}>
            <Typography variant="h6" sx={{
              fontWeight: 600,
              mb: 3,
              color: 'grey.800',
              fontSize: '1.1rem',
              textAlign: 'center'
            }}>
              Employee Information
            </Typography>
            <Box sx={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid',
              borderColor: 'grey.300',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <Table size="small" sx={{
              '& .MuiTableCell-root': {
                border: 'none',
                borderBottom: '1px solid',
                borderBottomColor: 'grey.300',
                fontSize: '0.95rem',
                py: 2,
                fontWeight: 400
              },
              '& .MuiTableRow-root:hover': {
                bgcolor: 'grey.100'
              },
              '& .MuiTableRow-root:nth-of-type(odd)': {
                bgcolor: 'grey.50'
              }
            }}>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.300', color: 'grey.800', width: '30%' }}>
                    Employee Name
                  </TableCell>
                  <TableCell sx={{ color: 'grey.800' }}>
                    {current.employee.name || '-'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.300', color: 'grey.800', width: '30%' }}>
                    Employee Code
                  </TableCell>
                  <TableCell sx={{ color: 'grey.800' }}>
                    {current.employee.code || '-'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.300', color: 'grey.800' }}>
                    Designation
                  </TableCell>
                  <TableCell sx={{ color: 'grey.800' }}>
                    {current.employee.designation || '-'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.300', color: 'grey.800' }}>
                    PAN
                  </TableCell>
                  <TableCell sx={{ color: 'grey.800' }}>
                    {current.employee.pan || '-'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.300', color: 'grey.800' }}>
                    Total Working Days
                  </TableCell>
                  <TableCell sx={{ color: 'grey.800' }}>
                    {current.workingDays?.totalWorkingDays ?? '-'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.300', color: 'grey.800' }}>
                    Days Attended
                  </TableCell>
                  <TableCell sx={{ color: 'grey.800' }}>
                    {current.workingDays?.daysAttended ?? '-'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.300', color: 'grey.800' }}>
                    Leaves Taken
                  </TableCell>
                  <TableCell sx={{ color: 'grey.800' }}>
                    {current.workingDays?.leavesTaken ?? '0'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.300', color: 'grey.800' }}>
                    Balance Leaves
                  </TableCell>
                  <TableCell sx={{ color: 'grey.800' }}>
                    {current.workingDays?.balanceLeaves ?? '0'}
                  </TableCell>
                </TableRow>
                {(current.employee.bankAccount || current.employee.bankName) && (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.300', color: 'grey.800' }}>
                      Bank Account
                    </TableCell>
                    <TableCell sx={{ color: 'grey.800' }}>
                      {current.employee.bankAccount || '-'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.300', color: 'grey.800' }}>
                      Bank Name
                    </TableCell>
                    <TableCell sx={{ color: 'grey.800' }}>
                      {current.employee.bankName || '-'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              </Table>
            </Box>
          </Box>

          {/* Earnings and Deductions Section */}
          <Box sx={{ mb: 5 }}>
            <Typography variant="h5" sx={{
              fontWeight: 600,
              mb: 4,
              color: 'grey.800',
              textAlign: 'center',
              fontSize: { xs: '1.3rem', md: '1.5rem' },
              letterSpacing: 0.3
            }}>
              Salary Breakdown
            </Typography>
            <Box sx={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid',
              borderColor: 'grey.300',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <Table className="earnings-deductions" sx={{
                '& .MuiTableCell-root': {
                  py: 2.5,
                  fontSize: '0.95rem',
                  fontWeight: 400
                }
              }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.300' }}>
                    <TableCell align="center" colSpan={2} sx={{
                      fontWeight: 600,
                      color: 'grey.800',
                      fontSize: '1.1rem',
                      py: 2.5,
                      letterSpacing: 0.5
                    }}>
                      Earnings
                    </TableCell>
                    <TableCell align="center" colSpan={2} sx={{
                      fontWeight: 600,
                      color: 'grey.800',
                      fontSize: '1.1rem',
                      py: 2.5,
                      letterSpacing: 0.5
                    }}>
                      Deductions
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell align="center" sx={{ fontWeight: 600, color: 'grey.700', fontSize: '0.9rem' }}>Particulars</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: 'grey.700', fontSize: '0.9rem' }}>Amount</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: 'grey.700', fontSize: '0.9rem' }}>Particulars</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: 'grey.700', fontSize: '0.9rem' }}>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableRows}
                  <TableRow sx={{
                    bgcolor: 'grey.200',
                    '& .MuiTableCell-root': {
                      color: 'grey.800',
                      fontWeight: 600,
                      fontSize: '1rem',
                      py: 2.5
                    }
                  }}>
                    <TableCell>Total Earnings</TableCell>
                    <TableCell align="right">{formattedValues.totalIncome}</TableCell>
                    <TableCell>Total Deductions</TableCell>
                    <TableCell align="right">{formattedValues.totalDeductions}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Box>

          {/* Net Salary Highlight */}
          <Box sx={netSalaryStyles}>
            <Typography variant="h6" sx={{
              color: 'grey.800',
              fontWeight: 500,
              opacity: 0.9,
              mb: 1.5,
              fontSize: { xs: '1.1rem', md: '1.25rem' },
              letterSpacing: 0.5
            }}>
              Net Salary
            </Typography>
            <Typography variant="h3" sx={{
              color: 'grey.800',
              fontWeight: 600,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              letterSpacing: 0.5,
              lineHeight: 1.1
            }}>
              {formattedValues.netSalary}
            </Typography>
          </Box>

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
