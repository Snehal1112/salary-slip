import React from 'react'
import { Container, Typography } from '@mui/material'
import PageBreadcrumbs from '../components/PageBreadcrumbs'
import { useNavigate } from 'react-router-dom'
import EmployeeForm from '../features/employees/EmployeeForm'
import { useAppDispatch } from '../store/hooks'
import { addEmployee } from '../features/employees/employeesSlice'
import type { Employee, EmployeeRequired } from '../types/shared'

const CreateEmployeePage: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleSubmit = (data: Employee) => {
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
    dispatch(addEmployee(employeeData))
    navigate('/employees')
  }

  return (
    <Container sx={{ py: 3 }}>
      <PageBreadcrumbs />
      <Typography variant="h5" gutterBottom>Create employee</Typography>
      <EmployeeForm wizard initial={{}} onSubmit={handleSubmit} submitLabel="Create" onCancel={() => navigate('/employees')} />
    </Container>
  )
}

export default CreateEmployeePage
