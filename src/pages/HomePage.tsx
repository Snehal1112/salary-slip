import React from 'react'
import { Box, Button, Container, Typography } from '@mui/material'
import PageBreadcrumbs from '../components/PageBreadcrumbs'
import { Link as RouterLink } from 'react-router-dom'

const HomePage: React.FC = () => {
	return (
		<Container sx={{ py: 4 }}>
			<PageBreadcrumbs items={[{ label: 'Home' }]} />
			<Typography variant="h4" gutterBottom>
				Salary Slip Generator
			</Typography>
			<Box sx={{ display: 'flex', gap: 2 }}>
				<Button component={RouterLink} to="/form" variant="contained" color="primary">
					Generate New Slip
				</Button>
				<Button component={RouterLink} to="/employees" variant="outlined">
					Employees
				</Button>
			</Box>
		</Container>
	)
}

export default HomePage
