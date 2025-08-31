import React, { useState, useMemo } from 'react'
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
  People as PeopleIcon,
  FilterList as FilterListIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material'
import PageBreadcrumbs from '../components/PageBreadcrumbs'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import {
  addEmployee,
  updateEmployee,
  deleteEmployee,
  setFilters,
  clearFilters,
  selectFilteredEmployees,
  selectEmployeeFilters,
  selectUniqueDepartments,
  selectUniqueDesignations,
  selectEmployeesLoading,
  selectEmployeesError,
  selectEmployeeStats
} from '../features/employees/employeesSlice'
import { setEmployee } from '../features/salary/salarySlice'
import { useNavigate } from 'react-router-dom'
import type { Employee, EmployeeRequired } from '../types/shared'
import EmployeeForm from '../features/employees/EmployeeForm'

const EmployeesPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  // Use enhanced selectors
  const employees = useAppSelector(selectFilteredEmployees)
  const filters = useAppSelector(selectEmployeeFilters)
  const departments = useAppSelector(selectUniqueDepartments)
  const designations = useAppSelector(selectUniqueDesignations)
  const loading = useAppSelector(selectEmployeesLoading)
  const error = useAppSelector(selectEmployeesError)
  const stats = useAppSelector(selectEmployeeStats)

  const [editingId, setEditingId] = useState<string | undefined>(undefined)
  const [showAddForm, setShowAddForm] = useState<boolean>(false)
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string }>({ open: false })
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  })

  const handleSearchChange = (value: string) => {
    dispatch(setFilters({ search: value }))
  }

  const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
    dispatch(setFilters({ [filterType]: value }))
  }

  const handleClearFilters = () => {
    dispatch(clearFilters())
  }

  const handleAddEmployee = () => {
    setEditingId(undefined)
    setShowAddForm(true)
  }

  const handleCancelForm = () => {
    setEditingId(undefined)
    setShowAddForm(false)
  }

  const onSubmit = (data: Employee) => {
    try {
      // Convert Employee to EmployeeRequired by providing defaults for required fields
      const employeeData: EmployeeRequired = {
        ...data,
        code: data.code || '',
        designation: data.designation || '',
        pan: data.pan || '',
        bankAccount: data.bankAccount || '',
        bankName: data.bankName || '',
        chequeNumber: data.chequeNumber || '',
      }

      if (editingId) {
        dispatch(updateEmployee({ ...employeeData, id: editingId }))
        setSnackbar({ open: true, message: 'Employee updated successfully', severity: 'success' })
      } else {
        dispatch(addEmployee(employeeData))
        setSnackbar({ open: true, message: 'Employee added successfully', severity: 'success' })
        setShowAddForm(false) // Hide form after successful addition
      }
      setEditingId(undefined)
    } catch {
      setSnackbar({ open: true, message: 'Error saving employee', severity: 'error' })
    }
  }

  const onEdit = (e: EmployeeRequired) => {
    setEditingId(e.id)
    setShowAddForm(true) // Show form when editing
  }

  const onUse = (e: EmployeeRequired) => {
    dispatch(setEmployee(e))
    navigate(`/form?employeeId=${e.id}`)
  }

  const confirmRemove = (id?: string) => setConfirmDelete({ open: true, id })

  const handleDelete = () => {
    if (confirmDelete.id) {
      dispatch(deleteEmployee(confirmDelete.id))
      setSnackbar({ open: true, message: 'Employee deleted successfully', severity: 'success' })
    }
    setConfirmDelete({ open: false })
  }

  const initialEmployee = useMemo(() =>
    editingId ? employees.find(e => e.id === editingId) : undefined,
    [editingId, employees]
  )

  const hasFilters = filters.search || filters.department || filters.designation

  return (
    <Container sx={{ py: 3 }}>
      <PageBreadcrumbs muted size="small" />

      {/* Header with Stats */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Employee Management
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              icon={<PeopleIcon />}
              label={`${stats.totalEmployees} Total`}
              color="primary"
              variant="outlined"
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddIcon />}
              onClick={handleAddEmployee}
              sx={{
                fontWeight: 600,
                textTransform: 'none',
                px: 3,
                py: 1,
                borderRadius: 2
              }}
            >
              Add Employee
            </Button>
          </Box>
        </Box>

        {/* Quick Stats */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Chip label={`${stats.activeEmployees} Active`} color="success" size="small" />
          <Chip label={`${Object.keys(stats.departmentCounts).length} Departments`} color="info" size="small" />
          <Chip label={`${stats.recentlyAdded} New This Month`} color="warning" size="small" />
        </Stack>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField
            fullWidth
            placeholder="Search employees..."
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
            <InputLabel>Department</InputLabel>
            <Select
              value={filters.department || ''}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              label="Department"
            >
              <MenuItem value="">All</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Designation</InputLabel>
            <Select
              value={filters.designation || ''}
              onChange={(e) => handleFilterChange('designation', e.target.value)}
              label="Designation"
            >
              <MenuItem value="">All</MenuItem>
              {designations.map((designation) => (
                <MenuItem key={designation} value={designation}>
                  {designation}
                </MenuItem>
              ))}
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

      {/* Employee Form - Only show when adding or editing */}
      {(showAddForm || editingId) && (
        <Box sx={{ mb: 3 }}>
          <EmployeeForm
            wizard={false}
            initial={initialEmployee}
            onSubmit={onSubmit}
            onCancel={handleCancelForm}
            submitLabel={editingId ? 'Update Employee' : 'Add Employee'}
            showHeader={true}
          />
        </Box>
      )}

      {/* Employee List */}
      <Paper sx={{ mt: 3 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Employees ({employees.length})
          </Typography>
        </Box>

        <TableContainer>
          {employees.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {hasFilters ? 'No employees match your filters' : 'No employees added yet'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {hasFilters
                  ? 'Try adjusting your search terms or filters.'
                  : 'Get started by adding your first employee.'
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
                  startIcon={<PersonAddIcon />}
                  onClick={handleAddEmployee}
                  sx={{ fontWeight: 600 }}
                >
                  Add Your First Employee
                </Button>
              )}
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Designation</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>PAN</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 140 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((e) => (
                  <TableRow
                    key={e.id}
                    hover
                    sx={{
                      '&:nth-of-type(odd)': { bgcolor: 'action.selected' },
                      '&:last-child td, &:last-child th': { border: 0 }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>{e.name}</TableCell>
                    <TableCell>
                      <Chip label={e.code} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{e.designation || '-'}</TableCell>
                    <TableCell>{e.department || '-'}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{e.pan || '-'}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Edit Employee">
                          <IconButton size="small" onClick={() => onEdit(e)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Use for Salary Slip">
                          <IconButton size="small" color="primary" onClick={() => onUse(e)}>
                            <LaunchIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Employee">
                          <IconButton size="small" color="error" onClick={() => confirmRemove(e.id)}>
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
        <DialogTitle>Delete Employee?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this employee? This action cannot be undone.
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

export default EmployeesPage
