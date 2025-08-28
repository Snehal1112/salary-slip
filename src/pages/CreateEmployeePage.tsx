import React from 'react'
import { Container, Typography } from '@mui/material'
import PageBreadcrumbs from '../components/PageBreadcrumbs'
import { useNavigate } from 'react-router-dom'
import EmployeeForm from '../features/employees/EmployeeForm'
import { useAppDispatch } from '../store/hooks'
import { addEmployee } from '../features/employees/employeesSlice'
import type { Employee } from '../features/employees/types'

const CreateEmployeePage: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleSubmit = (data: Employee) => {
    dispatch(addEmployee(data))
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
