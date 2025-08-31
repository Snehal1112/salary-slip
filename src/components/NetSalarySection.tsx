import React from 'react'
import { Box, Typography } from '@mui/material'

interface NetSalarySectionProps {
  netSalary: string
}

const NetSalarySection: React.FC<NetSalarySectionProps> = ({ netSalary }) => {
  return (
    <Box sx={{
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
    }}>
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
        {netSalary}
      </Typography>
    </Box>
  )
}

export default NetSalarySection