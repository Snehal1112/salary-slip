import React from 'react'
import { Breadcrumbs, Link, Typography, Box } from '@mui/material'
import { Link as RouterLink, useLocation } from 'react-router-dom'

type Crumb = { label: string; to?: string }

type Props = {
  items?: Crumb[]
  size?: 'small' | 'medium'
  muted?: boolean
  separator?: React.ReactNode
}

function humanize(segment: string) {
  if (!segment) return ''
  const s = decodeURIComponent(segment).replace(/[-_]/g, ' ')
  return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

const PageBreadcrumbs: React.FC<Props> = ({ items, size = 'medium', muted = false, separator = '›' }) => {
  let location
  try {
    // try to read location from router; in tests there may be no Router, so catch the invariant
    // eslint-disable-next-line react-hooks/rules-of-hooks
    location = useLocation()
  } catch {
    // fallback to a minimal location object
    // keep shape consistent for downstream code
    // Note: we still call the hook in environments with Router to follow rules-of-hooks
    // when Router is absent, use the fallback to avoid throwing in tests
    location = { pathname: '/' }
  }

  const crumbs: Crumb[] = React.useMemo(() => {
    if (items && items.length > 0) return items
    const path = location.pathname || '/'
    const segs = path.split('/').filter(Boolean)
    if (segs.length === 0) return [{ label: 'Home', to: '/' }]
    const result: Crumb[] = [{ label: 'Home', to: '/' }]
    let acc = ''
    for (const seg of segs) {
      acc += `/${seg}`
      result.push({ label: humanize(seg), to: acc })
    }
    return result
  }, [items, location.pathname])

  if (!crumbs || crumbs.length === 0) return null
  
  // Don't show breadcrumbs on home page or when only "Home" is present
  if (crumbs.length === 1 && crumbs[0].label === 'Home') return null

  const lastIndex = crumbs.length - 1

  return (
    <Box
      sx={{
        mb: 3,
        py: 2,
        px: 3,
        backgroundColor: 'grey.50',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'grey.200',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}
    >
      <Breadcrumbs 
        aria-label="breadcrumb" 
        separator={separator} 
        sx={{ 
          '& .MuiBreadcrumbs-separator': {
            color: 'grey.400',
            mx: 1,
            fontSize: '0.875rem'
          }
        }}
      >
        {crumbs.map((c, i) =>
          c.to && i !== lastIndex ? (
            <Link
              key={i}
              component={RouterLink}
              to={c.to}
              underline="none"
              color={muted ? 'text.secondary' : 'primary.main'}
              sx={{ 
                fontSize: size === 'small' ? '0.8rem' : '0.875rem',
                fontWeight: 500,
                textDecoration: 'none',
                padding: '4px 8px',
                borderRadius: 0.5,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }
              }}
            >
              {c.label}
            </Link>
          ) : (
            <Typography 
              key={i} 
              sx={{ 
                fontSize: size === 'small' ? '0.8rem' : '0.875rem',
                fontWeight: 600,
                color: muted ? 'text.secondary' : 'primary.dark',
                padding: '4px 8px',
                backgroundColor: 'primary.light',
                borderRadius: 0.5,
                border: '1px solid',
                borderColor: 'primary.main'
              }}
            >
              {c.label}
            </Typography>
          )
        )}
      </Breadcrumbs>
    </Box>
  )
}

export default PageBreadcrumbs
