import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Container from '@mui/material/Container'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from './theme/theme'
import { store, persistor } from './store'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingSpinner from './components/LoadingSpinner'

// Lazy load page components
const HomePage = React.lazy(() => import('./pages/HomePage'))
const FormPage = React.lazy(() => import('./pages/FormPage'))
const PreviewPage = React.lazy(() => import('./pages/PreviewPage'))
const EmployeesPage = React.lazy(() => import('./pages/EmployeesPage'))
const CreateEmployeePage = React.lazy(() => import('./pages/CreateEmployeePage'))
const CompaniesPage = React.lazy(() => import('./pages/CompaniesPage'))
const CreateCompanyPage = React.lazy(() => import('./pages/CreateCompanyPage'))
const EditCompanyPage = React.lazy(() => import('./pages/EditCompanyPage'))

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <ErrorBoundary>
              <BrowserRouter>
                <Container
                  sx={{
                    width: '80rem',
                    maxWidth: { xs: '100%', sm: '720px', md: '960px', lg: '80rem' },
                    mx: 'auto',
                    mt: { xs: 2, sm: 3, md: 4 },
                    px: { xs: 2, sm: 3, md: 4 },
                    py: { xs: 2, md: 3 },
                    bgcolor: 'background.paper',
                    boxShadow: '0 6px 18px rgba(16,40,70,0.06)',
                    borderRadius: 2,
                  }}
                >
                  <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
                    <Routes>
                      <Route path="/" element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
                      <Route path="/form" element={<ErrorBoundary><FormPage /></ErrorBoundary>} />
                      <Route path="/employees" element={<ErrorBoundary><EmployeesPage /></ErrorBoundary>} />
                      <Route path="/employees/create" element={<ErrorBoundary><CreateEmployeePage /></ErrorBoundary>} />
                      <Route path="/companies" element={<ErrorBoundary><CompaniesPage /></ErrorBoundary>} />
                      <Route path="/companies/create" element={<ErrorBoundary><CreateCompanyPage /></ErrorBoundary>} />
                      <Route path="/companies/edit/:id" element={<ErrorBoundary><EditCompanyPage /></ErrorBoundary>} />
                      <Route path="/preview" element={<ErrorBoundary><PreviewPage /></ErrorBoundary>} />
                    </Routes>
                  </Suspense>
                </Container>
              </BrowserRouter>
            </ErrorBoundary>
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  )
}

export default App
