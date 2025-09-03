import React from 'react'
import { Container } from '@mui/material'
import PageBreadcrumbs from '../components/PageBreadcrumbs'
import { useNavigate, useParams } from 'react-router-dom'
import CompanyForm from '../features/companies/CompanyFormSimple'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { updateCompany, selectAllCompanies } from '../features/companies/companiesSlice'
import type { Company, CompanyRequired } from '../types/shared'

const EditCompanyPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const companies = useAppSelector(selectAllCompanies)
  const company = companies.find(c => c.id === id)

  const handleSubmit = (data: Company) => {
    if (!id) {
      navigate('/companies')
      return
    }

    // Convert Company to CompanyRequired by ensuring required fields
    const companyData: CompanyRequired = {
      ...data,
      id,
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

    dispatch(updateCompany(companyData))
    navigate('/companies')
  }

  if (!company) {
    navigate('/companies')
    return null
  }

  return (
    <Container sx={{ py: 3 }}>
      <PageBreadcrumbs />
      <CompanyForm
        initial={company}
        onSubmit={handleSubmit}
        submitLabel="Update Company"
        onCancel={() => navigate('/companies')}
        showHeader={true}
      />
    </Container>
  )
}

export default EditCompanyPage
