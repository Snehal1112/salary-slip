import React, { useState } from 'react'
import { Container, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions, TableContainer, IconButton, Tooltip, Stack } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import LaunchIcon from '@mui/icons-material/Launch'
import DeleteIcon from '@mui/icons-material/Delete'
import PageBreadcrumbs from '../components/PageBreadcrumbs'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { addEmployee, updateEmployee, deleteEmployee } from '../features/employees/employeesSlice'
import { setEmployee } from '../features/salary/salarySlice'
import { useNavigate } from 'react-router-dom'
import type { Employee, EmployeeRequired } from '../types/shared'
import EmployeeForm from '../features/employees/EmployeeForm'

// empty constant intentionally omitted - EmployeeForm provides defaults

const EmployeesPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const employees = useAppSelector(s => s.employees.list || [])
  const [editingId, setEditingId] = useState<string | undefined>(undefined)
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id?: string }>({ open: false })
  const navigate = useNavigate()

  const onSubmit = (data: Employee) => {
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
    } else {
      dispatch(addEmployee(employeeData))
    }
    setEditingId(undefined)
  }

  const onEdit = (e: EmployeeRequired) => {
    setEditingId(e.id)
    // prefill form by setting editingId and letting EmployeeForm receive initial via employees.find below
  }

  const onUse = (e: EmployeeRequired) => {
    // set current employee in store and navigate to form with employeeId query param
    dispatch(setEmployee(e))
    navigate(`/form?employeeId=${e.id}`)
  }

  const confirmRemove = (id?: string) => setConfirmDelete({ open: true, id })
  const handleDelete = () => {
    if (confirmDelete.id) dispatch(deleteEmployee(confirmDelete.id))
    setConfirmDelete({ open: false })
  }

  const initialEmployee = React.useMemo(() => editingId ? employees.find(e => e.id === editingId) : undefined, [editingId, employees]);

  return (
    <Container sx={{ py: 3 }}>
      <PageBreadcrumbs muted size="small" />
      <Typography variant="h5" gutterBottom>Employees</Typography>

      <EmployeeForm wizard={false} initial={initialEmployee} onSubmit={onSubmit} onCancel={() => setEditingId(undefined)} submitLabel={editingId ? 'Update' : 'Add'} />

      <TableContainer sx={{ mt: 2 }}>
        {employees.length === 0 ? (
          <Typography sx={{ p: 2 }} color="text.secondary">No employees added yet.</Typography>
        ) : (
          <Table size="small" sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Designation</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>PAN</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 140 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((e) => (
                <TableRow key={e.id} hover sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.selected' }, '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>{e.name}</TableCell>
                  <TableCell>{e.code}</TableCell>
                  <TableCell>{e.designation}</TableCell>
                  <TableCell>{e.pan}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => onEdit(e)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Use">
                        <IconButton size="small" onClick={() => onUse(e)}>
                          <LaunchIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
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

      <Dialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false })}>
        <DialogTitle>Delete employee?</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this employee? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete({ open: false })}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default EmployeesPage
