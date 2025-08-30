import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Container from '@mui/material/Container'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from './theme/theme'
import { store, persistor } from './store'
import HomePage from './pages/HomePage'
import FormPage from './pages/FormPage'
import PreviewPage from './pages/PreviewPage'
import EmployeesPage from './pages/EmployeesPage'
import CreateEmployeePage from './pages/CreateEmployeePage'
import ErrorBoundary from './components/ErrorBoundary'

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
                  <Routes>
                    <Route path="/" element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
                    <Route path="/form" element={<ErrorBoundary><FormPage /></ErrorBoundary>} />
                    <Route path="/employees" element={<ErrorBoundary><EmployeesPage /></ErrorBoundary>} />
                    <Route path="/employees/create" element={<ErrorBoundary><CreateEmployeePage /></ErrorBoundary>} />
                    <Route path="/preview" element={<ErrorBoundary><PreviewPage /></ErrorBoundary>} />
                  </Routes>
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
