import React from 'react'
import { Breadcrumbs, Link, Typography } from '@mui/material'
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

  const lastIndex = crumbs.length - 1

  return (
    <Breadcrumbs aria-label="breadcrumb" separator={separator} sx={{ mb: 1 }}>
      {crumbs.map((c, i) =>
        c.to && i !== lastIndex ? (
          <Link
            key={i}
            component={RouterLink}
            to={c.to}
            underline="hover"
            color={muted ? 'text.secondary' : 'inherit'}
            sx={{ fontSize: size === 'small' ? '0.75rem' : '0.875rem' }}
          >
            {c.label}
          </Link>
        ) : (
          <Typography key={i} color={muted ? 'text.secondary' : 'text.primary'} sx={{ fontSize: size === 'small' ? '0.75rem' : '0.875rem' }}>
            {c.label}
          </Typography>
        )
      )}
    </Breadcrumbs>
  )
}

export default PageBreadcrumbs
