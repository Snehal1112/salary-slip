import React, { useMemo } from 'react'
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'

interface LineItem {
  particular: string
  amount: number
}

interface EarningsDeductionsTableProps {
  income: LineItem[]
  deductions: LineItem[]
  totalIncome: string
  totalDeductions: string
  formatCurrency: (amount: number) => string
}

const EarningsDeductionsTable: React.FC<EarningsDeductionsTableProps> = ({
  income,
  deductions,
  totalIncome,
  totalDeductions,
  formatCurrency
}) => {
  // Memoized table rows for earnings and deductions
  const tableRows = useMemo(() => {
    const left = income || []
    const right = deductions || []
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
            {l ? formatCurrency(l.amount) : ''}
          </TableCell>
          <TableCell sx={{ fontWeight: 400, color: r ? 'grey.700' : 'transparent' }}>
            {r ? r.particular : ''}
          </TableCell>
          <TableCell align="right" sx={{ fontWeight: 500, color: r ? 'grey.800' : 'transparent' }}>
            {r ? formatCurrency(r.amount) : ''}
          </TableCell>
        </TableRow>
      )
    }
    return rows
  }, [income, deductions, formatCurrency])

  return (
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
              <TableCell align="right">{totalIncome}</TableCell>
              <TableCell>Total Deductions</TableCell>
              <TableCell align="right">{totalDeductions}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    </Box>
  )
}

export default EarningsDeductionsTable