import React from 'react'
import { Container } from '@mui/material'
import PageBreadcrumbs from '../components/PageBreadcrumbs'
import { useNavigate } from 'react-router-dom'
import CompanyForm from '../features/companies/CompanyFormSimple'
import { useAppDispatch } from '../store/hooks'
import { addCompany } from '../features/companies/companiesSlice'
import type { Company, CompanyRequired } from '../types/shared'

const CreateCompanyPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleSubmit = (data: Company) => {
    // Convert Company to CompanyRequired by ensuring required fields
    const companyData: CompanyRequired = {
      ...data,
      name: data.name,
      addresses: data.addresses,
      isActive: data.isActive ?? true,
      // Optional fields with defaults
      gstin: data.gstin || '',
      pan: data.pan || '',
      tan: data.tan || '',
      cin: data.cin || '',
      email: data.email || '',
      phone: data.phone || '',
      website: data.website || '',
      pfRegistrationNumber: data.pfRegistrationNumber || '',
      esiRegistrationNumber: data.esiRegistrationNumber || '',
      ptRegistrationNumber: data.ptRegistrationNumber || '',
    }
    dispatch(addCompany(companyData))
    navigate('/companies')
  }

  return (
    <Container sx={{ py: 3 }}>
      <PageBreadcrumbs />
      <CompanyForm
        onSubmit={handleSubmit}
        submitLabel="Create Company"
        onCancel={() => navigate('/companies')}
        showHeader={true}
      />
    </Container>
  )
}

export default CreateCompanyPage
