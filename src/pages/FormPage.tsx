import React from 'react';
import type { FormValues } from '../features/salary/types';
import CompanyDetailsCard from '../components/CompanyDetailsCard';
import { Container, TextField, Box, Button, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Switch, FormControlLabel, Divider } from '@mui/material';
import PageBreadcrumbs from '../components/PageBreadcrumbs';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { saveSlip } from '../features/salary/salarySlice';
import { setCompany, setEmployee } from '../features/salary/salarySlice';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import logger from '../utils/logger';

const schema = yup.object({
  company: yup.object({
    name: yup.string().required('Company name required'),
    address: yup.array().of(yup.string().required('Address line required')).min(1, 'At least one address line required').required(),
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
  });
  const { register, handleSubmit, control, getValues } = form;

  const { fields: incomeFields, append: appendIncome, remove: removeIncome } = useFieldArray({ control, name: 'income' });
  const { fields: dedFields, append: appendDed, remove: removeDed } = useFieldArray({ control, name: 'deductions' });

  const onSubmit = () => {
    // DEBUG: log form submit
    if (process.env.NODE_ENV === 'test') {
      logger.debug('FormPage', 'Form submit handler called');
    }
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
    dispatch({ type: 'salary/setWorkingDays', payload: formValues.workingDays }); // <-- ensure workingDays is updated
    dispatch(saveSlip());
    if (process.env.NODE_ENV !== 'test') {
      navigate('/preview');
    }
  };

  return (
    <Container sx={{ py: 3 }}>
      <PageBreadcrumbs muted size="small" />
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Company & Employee Details Section - now two separate cards */}
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' }, mb: 3 }}>
          <Box sx={{ flex: '1 1 0' }}>
            <CompanyDetailsCard form={form} />
          </Box>
          <Box sx={{ flex: '1 1 0' }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Employee Details</Typography>
              <TextField label="Employee Name" variant="outlined" fullWidth size="medium" sx={{ mb: 2 }} {...register('employee.name')} />
              <TextField label="Employee Code" variant="outlined" fullWidth size="medium" sx={{ mb: 2 }} {...register('employee.code')} />
              <TextField label="Designation" variant="outlined" fullWidth size="medium" sx={{ mb: 2 }} {...register('employee.designation')} />
              <TextField label="PAN" variant="outlined" fullWidth size="medium" sx={{ mb: 2 }} {...register('employee.pan')} />
              <TextField label="Bank Account Number" variant="outlined" fullWidth size="medium" sx={{ mb: 2 }} {...register('employee.bankAccount')} />
              <TextField label="Bank Name" variant="outlined" fullWidth size="medium" sx={{ mb: 2 }} {...register('employee.bankName')} />
              <TextField label="Cheque Number" variant="outlined" fullWidth size="medium" sx={{ mb: 2 }} {...register('employee.chequeNumber')} />
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Working Days</Typography>
                <TextField label="Total Working Days" variant="outlined" fullWidth size="medium" type="number" sx={{ mb: 2 }} {...register('workingDays.totalWorkingDays')} />
                <TextField label="Number of Working Days Attended" variant="outlined" fullWidth size="medium" type="number" sx={{ mb: 2 }} {...register('workingDays.daysAttended')} />
                <TextField label="Leaves Taken" variant="outlined" fullWidth size="medium" type="number" sx={{ mb: 2 }} {...register('workingDays.leavesTaken')} />
                <TextField label="Balance Leaves" variant="outlined" fullWidth size="medium" type="number" sx={{ mb: 2 }} {...register('workingDays.balanceLeaves')} />
              </Box>
            </Paper>
          </Box>
        </Box>
        {/* Income & Deductions Section */}
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' }, mt: 2 }}>
          <Box sx={{ flex: '1 1 0' }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Income</Typography>
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
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Deductions</Typography>
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
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Typography>Total Income: <strong>{currentRaw.totalIncome}</strong></Typography>
            <Typography>Total Deductions: <strong>{currentRaw.totalDeductions}</strong></Typography>
            <Typography>Net: <strong>{currentRaw.netSalary}</strong></Typography>
          </Box>
          <Box>
            <Button type="submit" variant="contained" color="primary" size="small" sx={{ mr: 1, px: 3 }}>SAVE SLIP</Button>
            <Button variant="outlined" href="/preview" size="small">PREVIEW</Button>
          </Box>
        </Box>
        <Divider sx={{ my: 3 }} />
        {/* Template settings */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1">Template settings</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
            <TextField label="Title text" {...register('template.titleText')} sx={{ flex: 1 }} />
            <TextField label="Title align" {...register('template.titleAlign')} sx={{ width: 160 }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
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
    </Container>
  );
};

export default FormPage;
