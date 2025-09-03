import React, { useState } from 'react'
import {
  Container,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  IconButton,
  Tooltip,
  Stack,
  Paper,
  Box,
  TextField,
  InputAdornment,
  Chip,
  Alert,
  LinearProgress,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import {
  Edit as EditIcon,
  Launch as LaunchIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Business as BusinessIcon,
  FilterList as FilterListIcon,
  Add as AddIcon
} from '@mui/icons-material'
import PageBreadcrumbs from '../components/PageBreadcrumbs'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import {
  deleteCompany,
  setFilters,
  clearFilters,
  selectFilteredCompanies,
  selectCompanyFilters,
  selectCompaniesLoading,
  selectCompaniesError,
  selectCompanyStats
} from '../features/companies/companiesSlice'
import { setCompanyFromManagement } from '../features/salary/salarySlice'
import { useNavigate } from 'react-router-dom'
import type { CompanyRequired } from '../types/shared'

const CompaniesPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  // Use enhanced selectors
  const companies = useAppSelector(selectFilteredCompanies)
  const filters = useAppSelector(selectCompanyFilters)
  const loading = useAppSelector(selectCompaniesLoading)
  const error = useAppSelector(selectCompaniesError)
  const stats = useAppSelector(selectCompanyStats)

  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string }>({ open: false })
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  })

  const handleSearchChange = (value: string) => {
    dispatch(setFilters({ search: value }))
  }

  const handleFilterChange = (filterType: keyof typeof filters, value: string | boolean) => {
    dispatch(setFilters({ [filterType]: value }))
  }

  const handleClearFilters = () => {
    dispatch(clearFilters())
  }

  const handleAddCompany = () => {
    navigate('/companies/create')
  }



  const onEdit = (company: CompanyRequired) => {
    navigate(`/companies/${company.id}`)
  }

  const onUse = (company: CompanyRequired) => {
    // Set company data in salary slice and navigate to form
    dispatch(setCompanyFromManagement(company))
    navigate('/form')
  }

  const confirmRemove = (id?: string) => setConfirmDelete({ open: true, id })

  const handleDelete = () => {
    if (confirmDelete.id) {
      dispatch(deleteCompany(confirmDelete.id))
      setSnackbar({ open: true, message: 'Company deleted successfully', severity: 'success' })
    }
    setConfirmDelete({ open: false })
  }

  const hasFilters = filters.search || filters.isActive !== 'all'

  const formatAddress = (addresses: { city?: string; state?: string; isPrimary?: boolean }[]) => {
    const primary = addresses.find(addr => addr.isPrimary) || addresses[0]
    if (!primary) return '-'

    return `${primary.city}, ${primary.state}`
  }

  return (
    <Container sx={{ py: 3 }}>
      <PageBreadcrumbs muted size="small" />

      {/* Header with Stats */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Company Management
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              icon={<BusinessIcon />}
              label={`${stats.totalCompanies} Total`}
              color="primary"
              variant="outlined"
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddCompany}
              sx={{
                fontWeight: 600,
                textTransform: 'none',
                px: 3,
                py: 1,
                borderRadius: 2
              }}
            >
              Add Company
            </Button>
          </Box>
        </Box>

        {/* Quick Stats */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Chip label={`${stats.activeCompanies} Active`} color="success" size="small" />
          <Chip label={`${stats.recentlyAdded} New This Month`} color="warning" size="small" />
        </Stack>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField
            fullWidth
            placeholder="Search companies..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1 }}
          />

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.isActive === 'all' ? 'all' : filters.isActive}
              onChange={(e) => handleFilterChange('isActive', e.target.value === 'all' ? 'all' : e.target.value === 'true')}
              label="Status"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={handleClearFilters}
            disabled={!hasFilters}
          >
            Clear
          </Button>
        </Stack>
      </Paper>

      {/* Loading and Error States */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Company List */}
      <Paper
        elevation={1}
        sx={{
          borderRadius: 2,
          mt: 3
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Companies ({companies.length})
          </Typography>
        </Box>

        <TableContainer>
          {companies.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <BusinessIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {hasFilters ? 'No companies match your filters' : 'No companies added yet'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {hasFilters
                  ? 'Try adjusting your search terms or filters.'
                  : 'Get started by adding your first company.'
                }
              </Typography>
              {hasFilters ? (
                <Button variant="outlined" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddCompany}
                  sx={{ fontWeight: 600 }}
                >
                  Add Your First Company
                </Button>
              )}
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>GSTIN</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 140 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {companies.map((company) => (
                  <TableRow
                    key={company.id}
                    hover
                    sx={{
                      '&:nth-of-type(odd)': { bgcolor: 'action.selected' },
                      '&:last-child td, &:last-child th': { border: 0 }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>{company.name}</TableCell>
                    <TableCell>
                      {company.gstin ? (
                        <Chip label={company.gstin} size="small" variant="outlined" />
                      ) : '-'}
                    </TableCell>
                    <TableCell>{company.email || '-'}</TableCell>
                    <TableCell>{company.phone || '-'}</TableCell>
                    <TableCell>{formatAddress(company.addresses)}</TableCell>
                    <TableCell>
                      <Chip
                        label={company.isActive ? 'Active' : 'Inactive'}
                        color={company.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Edit Company">
                          <IconButton size="small" onClick={() => onEdit(company)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Use for Salary Slip">
                          <IconButton size="small" color="primary" onClick={() => onUse(company)}>
                            <LaunchIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Company">
                          <IconButton size="small" color="error" onClick={() => confirmRemove(company.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false })}>
        <DialogTitle>Delete Company?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this company? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete({ open: false })}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default CompaniesPage
