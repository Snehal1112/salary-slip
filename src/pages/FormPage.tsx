import React, { useEffect, useCallback, useState } from 'react';
import type { FormValues } from '../features/salary/types';
import CompanyDetailsCard from '../components/CompanyDetailsCard';
import { 
  Container, TextField, Box, Button, Typography, Paper, Table, TableBody, 
  TableCell, TableHead, TableRow, IconButton, Switch, FormControlLabel, 
  Divider, Alert, Snackbar, CircularProgress, Chip
} from '@mui/material';
import PageBreadcrumbs from '../components/PageBreadcrumbs';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import PreviewIcon from '@mui/icons-material/Preview';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  saveSlip, setCompany, setEmployee, setIncome, setDeductions, 
  setWorkingDays, setTemplate, recalc 
} from '../features/salary/salarySlice';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import logger from '../utils/logger';
import { formatCurrency } from '../utils/currency';

const schema = yup.object({
  company: yup.object({
    name: yup.string().required('Company name required'),
    address: yup.array().of(yup.string().default('')).min(1, 'At least one address line required').required()
      .test('at-least-one-non-empty', 'At least one address line must be filled', function(value) {
        return value && value.some(line => line && line.trim().length > 0);
      }),
    mobile: yup.string().optional(),
    gstin: yup.string().optional(),
    email: yup.string().email().optional(),
    website: yup.string().url().optional(),
  }),
  employee: yup.object({
    name: yup.string().required('Employee name required'),
    code: yup.string().optional(),
    designation: yup.string().optional(),
    pan: yup.string().optional(),
    bankAccount: yup.string().optional(),
    bankName: yup.string().optional(),
    chequeNumber: yup.string().optional(),
  }),
  workingDays: yup.object({
    totalWorkingDays: yup.number().min(0).required(),
    daysAttended: yup.number().min(0).required(),
    leavesTaken: yup.number().min(0).required(),
    balanceLeaves: yup.number().min(0).required(),
  }).required(),
  income: yup.array().of(yup.object({ particular: yup.string().required(), amount: yup.number().min(0).required() })).required(),
  deductions: yup.array().of(yup.object({ particular: yup.string().required(), amount: yup.number().min(0).required() })).required(),
  template: yup.object({
    titleText: yup.string().optional(),
    titleAlign: yup.string().oneOf(['left', 'center', 'right']).optional(),
    showCompanyName: yup.boolean().optional(),
    showCompanyAddress: yup.boolean().optional(),
  }).required(),
});

const FormPage: React.FC = () => {
  const currentRaw = useAppSelector((s) => s.salary.current);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({ 
    open: false, message: '', severity: 'success' 
  });
  
  const defaultValues: FormValues = {
    company: {
      name: currentRaw.company?.name || '',
      address: Array.isArray(currentRaw.company?.address)
        ? [...currentRaw.company.address]
        : currentRaw.company?.address
          ? [currentRaw.company.address]
          : [''],
      mobile: currentRaw.company?.mobile || '',
      gstin: currentRaw.company?.gstin || '',
      email: currentRaw.company?.email || '',
      website: typeof currentRaw.company?.website === 'string' ? currentRaw.company.website : '',
      contactNumber: currentRaw.company?.contactNumber || '',
    },
    employee: {
      name: currentRaw.employee?.name || '',
      code: currentRaw.employee?.code || '',
      designation: currentRaw.employee?.designation || '',
      pan: currentRaw.employee?.pan || '',
      bankAccount: currentRaw.employee?.bankAccount || '',
      bankName: currentRaw.employee?.bankName || '',
      chequeNumber: currentRaw.employee?.chequeNumber || '',
    },
    workingDays: {
      totalWorkingDays: currentRaw.workingDays?.totalWorkingDays ?? 0,
      daysAttended: currentRaw.workingDays?.daysAttended ?? 0,
      leavesTaken: currentRaw.workingDays?.leavesTaken ?? 0,
      balanceLeaves: currentRaw.workingDays?.balanceLeaves ?? 0,
    },
    income: Array.isArray(currentRaw.income) ? [...currentRaw.income] : [],
    deductions: Array.isArray(currentRaw.deductions) ? [...currentRaw.deductions] : [],
    template: {
      titleText: currentRaw.template?.titleText || '',
      titleAlign: currentRaw.template?.titleAlign || 'right',
      showCompanyName: currentRaw.template?.showCompanyName ?? true,
      showCompanyAddress: currentRaw.template?.showCompanyAddress ?? true,
    },
  };
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const form = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues,
    mode: 'onChange',
  });
  const { register, handleSubmit, control, getValues, formState: { errors, isValid } } = form;

  const { fields: incomeFields, append: appendIncome, remove: removeIncome } = useFieldArray({ control, name: 'income' });
  const { fields: dedFields, append: appendDed, remove: removeDed } = useFieldArray({ control, name: 'deductions' });

  // Watch form changes for real-time updates
  const watchedIncome = useWatch({ control, name: 'income' });
  const watchedDeductions = useWatch({ control, name: 'deductions' });
  const watchedWorkingDays = useWatch({ control, name: 'workingDays' });
  const watchedTemplate = useWatch({ control, name: 'template' });

  // Real-time sync with Redux state for calculations
  useEffect(() => {
    if (watchedIncome) {
      dispatch(setIncome(watchedIncome));
      dispatch(recalc());
    }
  }, [watchedIncome, dispatch]);

  useEffect(() => {
    if (watchedDeductions) {
      dispatch(setDeductions(watchedDeductions));
      dispatch(recalc());
    }
  }, [watchedDeductions, dispatch]);

  useEffect(() => {
    if (watchedWorkingDays) {
      dispatch(setWorkingDays(watchedWorkingDays));
    }
  }, [watchedWorkingDays, dispatch]);

  useEffect(() => {
    if (watchedTemplate) {
      dispatch(setTemplate(watchedTemplate));
    }
  }, [watchedTemplate, dispatch]);

  const saveFormData = useCallback(async () => {
    const formValues = getValues();
    const companyForRedux = {
      name: formValues.company.name || '',
      address: Array.isArray(formValues.company.address)
        ? formValues.company.address.map((a: string) => a)
        : [formValues.company.address ?? ''],
      mobile: formValues.company.mobile || '',
      gstin: formValues.company.gstin || '',
      email: formValues.company.email || '',
      website: typeof formValues.company.website === 'string' ? formValues.company.website : '',
    };
    
    dispatch(setCompany(companyForRedux));
    dispatch(setEmployee(formValues.employee));
    dispatch(setWorkingDays(formValues.workingDays));
    dispatch(setIncome(formValues.income));
    dispatch(setDeductions(formValues.deductions));
    dispatch(setTemplate(formValues.template));
    dispatch(recalc());
  }, [dispatch, getValues]);

  const onSubmit = async () => {
    setSaving(true);
    try {
      // DEBUG: log form submit
      if (process.env.NODE_ENV === 'test') {
        logger.debug('FormPage', 'Form submit handler called');
      }
      
      await saveFormData();
      dispatch(saveSlip());
      
      setSnackbar({ open: true, message: 'Salary slip saved successfully!', severity: 'success' });
      
      if (process.env.NODE_ENV !== 'test') {
        setTimeout(() => navigate('/preview'), 500); // Small delay for UX
      }
    } catch {
      setSnackbar({ open: true, message: 'Error saving salary slip', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = useCallback(async () => {
    await saveFormData();
    navigate('/preview');
  }, [saveFormData, navigate]);

  return (
    <Container sx={{ py: 3 }}>
      <PageBreadcrumbs muted size="small" />
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Header with status */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" fontWeight={600}>
            Salary Slip Form
          </Typography>
          <Chip 
            label={isValid ? 'Valid' : 'Has Errors'} 
            color={isValid ? 'success' : 'warning'} 
            size="small" 
          />
        </Box>
        
        {/* Company & Employee Details Section - now two separate cards */}
        <Box sx={{ display: 'flex', gap: { xs: 2, md: 3 }, flexDirection: { xs: 'column', md: 'row' }, mb: 4 }}>
          <Box sx={{ flex: '1 1 0' }}>
            <CompanyDetailsCard form={form} />
          </Box>
          <Box sx={{ flex: '1 1 0' }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: 'fit-content' }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Employee Details</Typography>
              <TextField 
                label="Employee Name" 
                variant="outlined" 
                fullWidth 
                size="medium" 
                sx={{ mb: 2 }} 
                {...register('employee.name')}
                error={!!errors.employee?.name}
                helperText={errors.employee?.name?.message}
              />
              <TextField 
                label="Employee Code" 
                variant="outlined" 
                fullWidth 
                size="medium" 
                sx={{ mb: 2 }} 
                {...register('employee.code')}
                error={!!errors.employee?.code}
                helperText={errors.employee?.code?.message}
              />
              <TextField 
                label="Designation" 
                variant="outlined" 
                fullWidth 
                size="medium" 
                sx={{ mb: 2 }} 
                {...register('employee.designation')}
                error={!!errors.employee?.designation}
                helperText={errors.employee?.designation?.message}
              />
              <TextField 
                label="PAN" 
                variant="outlined" 
                fullWidth 
                size="medium" 
                sx={{ mb: 2 }} 
                {...register('employee.pan')}
                error={!!errors.employee?.pan}
                helperText={errors.employee?.pan?.message}
              />
              <TextField 
                label="Bank Account Number" 
                variant="outlined" 
                fullWidth 
                size="medium" 
                sx={{ mb: 2 }} 
                {...register('employee.bankAccount')}
                error={!!errors.employee?.bankAccount}
                helperText={errors.employee?.bankAccount?.message}
              />
              <TextField 
                label="Bank Name" 
                variant="outlined" 
                fullWidth 
                size="medium" 
                sx={{ mb: 2 }} 
                {...register('employee.bankName')}
                error={!!errors.employee?.bankName}
                helperText={errors.employee?.bankName?.message}
              />
              <TextField 
                label="Cheque Number" 
                variant="outlined" 
                fullWidth 
                size="medium" 
                sx={{ mb: 2 }} 
                {...register('employee.chequeNumber')}
                error={!!errors.employee?.chequeNumber}
                helperText={errors.employee?.chequeNumber?.message}
              />
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Working Days</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField 
                  label="Total Working Days" 
                  variant="outlined" 
                  fullWidth 
                  size="medium" 
                  type="number" 
                  inputProps={{ min: 0 }}
                  {...register('workingDays.totalWorkingDays')}
                  error={!!errors.workingDays?.totalWorkingDays}
                  helperText={errors.workingDays?.totalWorkingDays?.message}
                />
                <TextField 
                  label="Days Attended" 
                  variant="outlined" 
                  fullWidth 
                  size="medium" 
                  type="number" 
                  inputProps={{ min: 0 }}
                  {...register('workingDays.daysAttended')}
                  error={!!errors.workingDays?.daysAttended}
                  helperText={errors.workingDays?.daysAttended?.message}
                />
                <TextField 
                  label="Leaves Taken" 
                  variant="outlined" 
                  fullWidth 
                  size="medium" 
                  type="number" 
                  inputProps={{ min: 0 }}
                  {...register('workingDays.leavesTaken')}
                  error={!!errors.workingDays?.leavesTaken}
                  helperText={errors.workingDays?.leavesTaken?.message}
                />
                <TextField 
                  label="Balance Leaves" 
                  variant="outlined" 
                  fullWidth 
                  size="medium" 
                  type="number" 
                  inputProps={{ min: 0 }}
                  {...register('workingDays.balanceLeaves')}
                  error={!!errors.workingDays?.balanceLeaves}
                  helperText={errors.workingDays?.balanceLeaves?.message}
                />
              </Box>
            </Paper>
          </Box>
        </Box>
        {/* Income & Deductions Section */}
        <Box sx={{ display: 'flex', gap: { xs: 2, md: 3 }, flexDirection: { xs: 'column', lg: 'row' }, mt: 4 }}>
          <Box sx={{ flex: '1 1 0' }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>Income</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total: {formatCurrency(currentRaw.totalIncome)}
                </Typography>
              </Box>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Particular</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {incomeFields.map((f, i) => (
                    <TableRow key={f.id}>
                      <TableCell>
                        <TextField fullWidth defaultValue={f.particular} {...register(`income.${i}.particular` as const)} size="small" />
                      </TableCell>
                      <TableCell align="right" sx={{ width: '20%' }}>
                        <TextField type="number" defaultValue={f.amount} {...register(`income.${i}.amount` as const)} inputProps={{ min: 0 }} size="small" sx={{ width: 120 }} />
                      </TableCell>
                      <TableCell sx={{ width: '10%' }}>
                        <IconButton size="small" onClick={() => removeIncome(i)} aria-label="remove income"><DeleteIcon fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Button startIcon={<AddIcon />} onClick={() => appendIncome({ particular: 'New', amount: 0 })} size="small" variant="text" color="primary" sx={{ textTransform: 'none', fontWeight: 700 }}>Add Income</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>
          </Box>
          <Box sx={{ flex: '1 1 0' }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>Deductions</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total: {formatCurrency(currentRaw.totalDeductions)}
                </Typography>
              </Box>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Particular</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dedFields.map((f, i) => (
                    <TableRow key={f.id}>
                      <TableCell>
                        <TextField fullWidth defaultValue={f.particular} {...register(`deductions.${i}.particular` as const)} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <TextField type="number" defaultValue={f.amount} {...register(`deductions.${i}.amount` as const)} inputProps={{ min: 0 }} size="small" sx={{ width: 120 }} />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => removeDed(i)} aria-label="remove deduction"><DeleteIcon fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Button startIcon={<AddIcon />} onClick={() => appendDed({ particular: 'New Deduction', amount: 0 })} size="small" variant="text" color="primary" sx={{ textTransform: 'none', fontWeight: 700 }}>Add Deduction</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>
          </Box>
        </Box>
        {/* Summary and Actions */}
        <Paper sx={{ p: 3, mt: 4, borderRadius: 2, bgcolor: 'grey.50' }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Summary</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3, mb: 3 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Total Income</Typography>
              <Typography variant="h6" color="success.main" fontWeight={600}>
                {formatCurrency(currentRaw.totalIncome)}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Total Deductions</Typography>
              <Typography variant="h6" color="error.main" fontWeight={600}>
                {formatCurrency(currentRaw.totalDeductions)}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Net Salary</Typography>
              <Typography variant="h6" color="primary.main" fontWeight={600}>
                {formatCurrency(currentRaw.netSalary)}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Button 
              variant="outlined" 
              onClick={handlePreview}
              startIcon={<PreviewIcon />}
              disabled={saving}
              sx={{ minWidth: 120 }}
            >
              Preview
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
              disabled={saving || !isValid}
              sx={{ minWidth: 120 }}
            >
              {saving ? 'Saving...' : 'Save Slip'}
            </Button>
          </Box>
        </Paper>
        {/* Template settings */}
        <Paper sx={{ p: 3, mt: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Template Settings</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 2, mb: 2 }}>
            <TextField 
              label="Title text" 
              {...register('template.titleText')} 
              fullWidth
              error={!!errors.template?.titleText}
              helperText={errors.template?.titleText?.message}
            />
            <TextField 
              label="Title align" 
              select
              {...register('template.titleAlign')} 
              fullWidth
              SelectProps={{ native: true }}
              error={!!errors.template?.titleAlign}
              helperText={errors.template?.titleAlign?.message}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </TextField>
          </Box>
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
            <Controller
              name="template.showCompanyName"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label="Show company name"
                />
              )}
            />
            <Controller
              name="template.showCompanyAddress"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label="Show company address"
                />
              )}
            />
          </Box>
        </Paper>
      </form>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FormPage;
