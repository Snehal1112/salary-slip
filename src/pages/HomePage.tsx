import React from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Stack,
  Divider,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { loadSlip, deleteSlip } from '../features/salary/salarySlice';
import { selectEmployeeStats } from '../features/employees/employeesSlice';
import { formatCurrency } from '../utils/currency';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Get saved slips and employee stats
  const savedSlips = useAppSelector(state => state.salary.slips);
  const employeeStats = useAppSelector(selectEmployeeStats);

  const handleViewSlip = (slipId: string) => {
    dispatch(loadSlip(slipId));
    navigate('/preview');
  };

  const handleDeleteSlip = (slipId: string) => {
    dispatch(deleteSlip(slipId));
  };

  const recentSlips = savedSlips.slice(0, 5); // Show only 5 most recent

  return (
    <Container sx={{ py: 4 }}>

      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Salary Slip Management
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Professional salary slip management for your organization
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={2} sx={{ textAlign: 'center', py: 2 }}>
            <CardContent>
              <PeopleIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {employeeStats.totalEmployees}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Total Employees
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={2} sx={{ textAlign: 'center', py: 2 }}>
            <CardContent>
              <ReceiptIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {savedSlips.length}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Saved Slips
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card elevation={2} sx={{ textAlign: 'center', py: 2 }}>
            <CardContent>
              <FileDownloadIcon sx={{ fontSize: 48, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {Object.keys(employeeStats.departmentCounts).length}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Departments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
              <AddIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                Generate New Slip
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Create a new salary slip with automatic calculations, tax deductions, and professional formatting.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
              <Button
                component={RouterLink}
                to="/form"
                variant="contained"
                color="primary"
                size="large"
                startIcon={<AddIcon />}
                sx={{ px: 4 }}
              >
                Create Slip
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
              <PeopleIcon sx={{ fontSize: 64, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                Manage Employees
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Add, edit, and organize employee information with comprehensive details and search capabilities.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
              <Button
                component={RouterLink}
                to="/employees"
                variant="outlined"
                size="large"
                startIcon={<PeopleIcon />}
                sx={{ px: 4 }}
              >
                View Employees
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Salary Slips */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Recent Salary Slips
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {savedSlips.length} total
          </Typography>
        </Box>

        {savedSlips.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No salary slips created yet.
            <Button component={RouterLink} to="/form" color="primary" sx={{ ml: 1 }}>
              Create your first slip
            </Button>
          </Alert>
        ) : (
          <>
            <List>
              {recentSlips.map((slip, index) => (
                <React.Fragment key={slip.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {slip.employee.name}
                          </Typography>
                          <Chip label={slip.month} size="small" variant="outlined" />
                          <Chip
                            label={formatCurrency(slip.netSalary)}
                            size="small"
                            color="success"
                            variant="filled"
                          />
                        </Box>
                      }
                      secondary={
                        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Code: {slip.employee.code}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Created: {new Date(slip.createdAt).toLocaleDateString()}
                          </Typography>
                        </Stack>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewSlip(slip.id)}
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteSlip(slip.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < recentSlips.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            {savedSlips.length > 5 && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button
                  variant="text"
                  component={RouterLink}
                  to="/slips"
                  color="primary"
                >
                  View All {savedSlips.length} Slips
                </Button>
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* Quick Tips */}
      <Paper elevation={1} sx={{ p: 3, mt: 3, bgcolor: 'background.default' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          Quick Tips
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="body2" color="text.secondary">
              • Use the employee management system to maintain consistent data
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="body2" color="text.secondary">
              • All slips are automatically saved and can be exported as PDF
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="body2" color="text.secondary">
              • Professional tax and TDS calculations are built-in
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default HomePage;
