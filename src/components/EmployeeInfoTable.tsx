import React from 'react'
import { Box, Typography, Table, TableBody, TableCell, TableRow } from '@mui/material'

interface EmployeeInfoTableProps {
  employee: {
    name?: string
    code?: string
    designation?: string
    pan?: string
    bankAccount?: string
    bankName?: string
    chequeNumber?: string
  }
  workingDays?: {
    totalWorkingDays?: number
    daysAttended?: number
    leavesTaken?: number
    balanceLeaves?: number
  }
}

const EmployeeInfoTable: React.FC<EmployeeInfoTableProps> = ({ 
  employee, 
  workingDays 
}) => {
  return (
    <Box sx={{ mb: { xs: 4, md: 5 } }}>
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
                {employee.name || '-'}
              </TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.300', color: 'grey.800', width: '30%' }}>
                Employee Code
              </TableCell>
              <TableCell sx={{ color: 'grey.800' }}>
                {employee.code || '-'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.300', color: 'grey.800' }}>
                Designation
              </TableCell>
              <TableCell sx={{ color: 'grey.800' }}>
                {employee.designation || '-'}
              </TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.300', color: 'grey.800' }}>
                PAN
              </TableCell>
              <TableCell sx={{ color: 'grey.800' }}>
                {employee.pan || '-'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.300', color: 'grey.800' }}>
                Total Working Days
              </TableCell>
              <TableCell sx={{ color: 'grey.800' }}>
                {workingDays?.totalWorkingDays ?? '-'}
              </TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.300', color: 'grey.800' }}>
                Days Attended
              </TableCell>
              <TableCell sx={{ color: 'grey.800' }}>
                {workingDays?.daysAttended ?? '-'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.300', color: 'grey.800' }}>
                Leaves Taken
              </TableCell>
              <TableCell sx={{ color: 'grey.800' }}>
                {workingDays?.leavesTaken ?? '0'}
              </TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.300', color: 'grey.800' }}>
                Balance Leaves
              </TableCell>
              <TableCell sx={{ color: 'grey.800' }}>
                {workingDays?.balanceLeaves ?? '0'}
              </TableCell>
            </TableRow>
            {(employee.bankAccount || employee.bankName) && (
              <TableRow>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.300', color: 'grey.800' }}>
                  Bank Account
                </TableCell>
                <TableCell sx={{ color: 'grey.800' }}>
                  {employee.bankAccount || '-'}
                </TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.300', color: 'grey.800' }}>
                  Bank Name
                </TableCell>
                <TableCell sx={{ color: 'grey.800' }}>
                  {employee.bankName || '-'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Box>
  )
}

export default EmployeeInfoTable