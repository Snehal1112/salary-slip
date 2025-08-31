import React, { useMemo } from 'react'
import { Box, Typography } from '@mui/material'

interface CompanyHeaderProps {
  company: {
    name: string | string[]
    address?: string | string[]
    gstin?: string
    email?: string
    website?: string
    mobile?: string
    contactNumber?: string
  }
  template?: {
    showCompanyName?: boolean
    showCompanyAddress?: boolean
    titleText?: string
  }
  month?: string
}

const CompanyHeader: React.FC<CompanyHeaderProps> = ({
  company,
  template,
  month
}) => {
  // Memoized processed company name
  const processedCompanyName = useMemo(() => {
    if (typeof company.name === 'string') {
      return company.name.replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ').replace(/\n/g, ' ').trim()
    }
    return company.name
  }, [company.name])

  // Memoized processed company address
  const processedCompanyAddress = useMemo(() => {
    if (!company.address) return null

    if (Array.isArray(company.address)) {
      return company.address.map((line: string, idx: number) => ({
        key: idx,
        text: line
      }))
    }

    return String(company.address)
      .split(/,|\n/)
      .map((line: string, idx: number) => ({
        key: idx,
        text: line.trim()
      }))
  }, [company.address])

  return (
    <Box sx={{
      borderBottom: '2px solid',
      borderColor: 'grey.400',
      pb: { xs: 3, md: 4 },
      mb: { xs: 4, md: 5 },
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      p: { xs: 3, sm: 3.5, md: 4 },
      borderRadius: 2,
      boxShadow: '3px 3px 8px rgba(0,0,0,0.08)'
    }}>
      <div className="header">
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'center', sm: 'flex-start' },
          gap: { xs: 2, sm: 1 }
        }}>
          <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
            {template?.showCompanyName !== false && (
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
              {template?.showCompanyAddress !== false && company.address && (
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
                {company.gstin && (
                  <Typography variant="body2" sx={{
                    color: 'grey.500',
                    fontWeight: 400,
                    fontSize: { xs: '0.8rem', md: '0.875rem' }
                  }}>
                    <Box component="span" sx={{ fontWeight: 600, color: 'grey.700' }}>GSTIN:</Box> {company.gstin}
                  </Typography>
                )}
                {company.email && (
                  <Typography variant="body2" sx={{
                    color: 'grey.500',
                    fontWeight: 400,
                    fontSize: { xs: '0.8rem', md: '0.875rem' }
                  }}>
                    <Box component="span" sx={{ fontWeight: 600, color: 'grey.700' }}>Email:</Box> {company.email}
                  </Typography>
                )}
                {company.website && (
                  <Typography variant="body2" sx={{
                    color: 'grey.500',
                    fontWeight: 400,
                    fontSize: { xs: '0.8rem', md: '0.875rem' }
                  }}>
                    <Box component="span" sx={{ fontWeight: 600, color: 'grey.700' }}>Website:</Box> {company.website}
                  </Typography>
                )}
                {(company.mobile || company.contactNumber) && (
                  <Typography variant="body2" sx={{
                    color: 'grey.500',
                    fontWeight: 400,
                    fontSize: { xs: '0.8rem', md: '0.875rem' }
                  }}>
                    <Box component="span" sx={{ fontWeight: 600, color: 'grey.700' }}>Contact:</Box> {company.mobile || company.contactNumber}
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
              {template?.titleText || 'PAYSLIP'}
            </Typography>
            <Typography variant="body2" sx={{
              opacity: 0.85,
              fontSize: { xs: '0.8rem', md: '0.875rem' },
              fontWeight: 400
            }}>
              {month || new Date().toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
            </Typography>
          </Box>
        </Box>
      </div>
    </Box>
  )
}

export default CompanyHeader
