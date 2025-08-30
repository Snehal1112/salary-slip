import React from 'react';
import { Box, Button, Paper, Divider, Typography, Stack, Stepper, Step, StepLabel, Fade } from '@mui/material';
import type { StepIconProps } from '@mui/material/StepIcon';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { getJson, setJson, removeItem } from '../../utils/storage';
import logger from '../../utils/logger';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { Employee } from '../../types/shared';

// Import our new section components
import PersonalDetailsSection from './components/PersonalDetailsSection';
import EmergencyContactSection from './components/EmergencyContactSection';
import EducationHealthTaxSection from './components/EducationHealthTaxSection';
import BankingSection from './components/BankingSection';
import EmploymentSection from './components/EmploymentSection';
import AddressSection from './components/AddressSection';

const schema = yup.object({
  name: yup.string().required('Name is required'),
  code: yup.string().optional(),
  designation: yup.string().optional(),
  pan: yup.string().nullable().transform((val) => (val === '' ? null : val)).matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/i, 'Invalid PAN').optional(),
  address: yup.string().optional(),
  phone: yup.string().optional(),
  dob: yup.string().optional(),
  govId: yup.string().optional(),
  maritalStatus: yup.string().optional(),
  spouseName: yup.string().optional(),
  emergencyContactName: yup.string().optional(),
  emergencyContactPhone: yup.string().transform((val) => (val === '' ? undefined : val)).matches(/^[0-9]{10}$/, 'Enter 10 digit emergency contact').optional(),
  emergencyContactRelation: yup.string().optional(),
  department: yup.string().optional(),
  supervisor: yup.string().optional(),
  workLocation: yup.string().optional(),
  salary: yup.string().transform((val) => (val === '' ? undefined : val)).matches(/^\d+(?:\.\d{1,2})?$/, 'Enter a valid salary amount').optional(),
  education: yup.string().optional(),
  taxInfo: yup.string().optional(),
  healthConditions: yup.string().optional(),
  bankAccount: yup.string().nullable().transform((val) => (val === '' ? null : val)).matches(/^[0-9]{6,22}$/, 'Invalid bank account number').optional(),
  bankName: yup.string().when('bankAccount', {
    is: (val: unknown) => !!val,
    then: (s) => s.required('Bank name is required when account number provided'),
    otherwise: (s) => s.optional(),
  }),
  chequeNumber: yup.string().optional(),
  pfNumber: yup.string().transform((val) => (val === '' ? undefined : val)).matches(/^[A-Z0-9\-/]{3,20}$/i, 'Invalid PF number').optional(),
  esiNumber: yup.string().transform((val) => (val === '' ? undefined : val)).matches(/^[0-9]{1,15}$/, 'Invalid ESI number').optional(),
  joiningDate: yup.string().optional(),
  email: yup.string().transform((val) => (val === '' ? undefined : val)).email('Invalid email').optional(),
  mobile: yup.string().transform((val) => (val === '' ? undefined : val)).matches(/^[0-9]{10}$/, 'Enter 10 digit mobile').optional(),
});

type Props = {
  initial?: Partial<Employee>;
  onSubmit: (e: Employee) => void;
  onCancel?: () => void;
  submitLabel?: string;
  wizard?: boolean;
  showHeader?: boolean;
};

const StepIcon = React.memo(({ active, completed }: StepIconProps) => {
  if (completed) {
    return <CheckCircleIcon color="primary" />;
  }
  return (
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        bgcolor: active ? 'primary.main' : 'grey.300',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: active ? 'white' : 'grey.600',
        fontSize: '0.75rem',
        fontWeight: 'bold'
      }}
    >
      {active ? '•' : '○'}
    </Box>
  );
});

StepIcon.displayName = 'StepIcon';

const EmployeeForm = React.memo(({ 
  initial, 
  onSubmit, 
  onCancel, 
  submitLabel = 'Submit', 
  wizard = false, 
  showHeader = true 
}: Props) => {
  const [step, setStep] = React.useState(0);
  
  const draftKey = React.useMemo(() => `employee:draft:${(initial as Employee)?.id ?? 'new'}`, [initial]);

  // Create proper default values to prevent uncontrolled input warnings
  const defaultValues: Employee = React.useMemo(() => ({
    name: initial?.name || '',
    code: initial?.code || '',
    designation: initial?.designation || '',
    pan: initial?.pan || '',
    bankAccount: initial?.bankAccount || '',
    bankName: initial?.bankName || '',
    chequeNumber: initial?.chequeNumber || '',
    pfNumber: initial?.pfNumber || '',
    esiNumber: initial?.esiNumber || '',
    joiningDate: initial?.joiningDate || '',
    email: initial?.email || '',
    mobile: initial?.mobile || '',
    address: initial?.address || '',
    phone: initial?.phone || '',
    dob: initial?.dob || '',
    govId: initial?.govId || '',
    maritalStatus: initial?.maritalStatus || '',
    spouseName: initial?.spouseName || '',
    emergencyContactName: initial?.emergencyContactName || '',
    emergencyContactPhone: initial?.emergencyContactPhone || '',
    emergencyContactRelation: initial?.emergencyContactRelation || '',
    department: initial?.department || '',
    supervisor: initial?.supervisor || '',
    workLocation: initial?.workLocation || '',
    salary: initial?.salary || '',
    education: initial?.education || '',
    taxInfo: initial?.taxInfo || '',
    healthConditions: initial?.healthConditions || '',
    id: initial?.id,
  }), [initial]);

  const { control, handleSubmit, reset, getValues } = useForm<Employee>({
    resolver: yupResolver(schema) as Resolver<Employee>,
    defaultValues,
  });

  React.useEffect(() => {
    // Load draft on mount
    const draft = getJson<Employee>(draftKey);
    if (draft && (!initial || !initial.id)) {
      reset(draft);
      logger.debug('EmployeeForm', `Loaded draft for key: ${draftKey}`);
    }
  }, [draftKey, reset, initial]);

  const doSubmit = React.useCallback((formData: Employee) => {
    // Clear draft on submit
    removeItem(draftKey);
    onSubmit(formData);
  }, [onSubmit, draftKey]);

  const saveDraft = React.useCallback(() => {
    const values = getValues();
    setJson(draftKey, values);
    logger.debug('EmployeeForm', `Saved draft for key: ${draftKey}`);
  }, [getValues, draftKey]);

  React.useEffect(() => {
    const interval = setInterval(saveDraft, 10000);
    return () => clearInterval(interval);
  }, [saveDraft]);

  const nextStep = () => setStep(prev => Math.min(prev + 1, 2));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 0));

  if (wizard) {
    return (
      <Paper sx={{ p: { xs: 2, md: 3 }, pl: { md: 4 }, mb: 2, borderRadius: 2 }} elevation={2}>
        <Stepper activeStep={step} sx={{ mb: 3 }}>
          <Step>
            <StepLabel StepIconComponent={StepIcon}>Personal & Contact</StepLabel>
          </Step>
          <Step>
            <StepLabel StepIconComponent={StepIcon}>Banking & Statutory</StepLabel>
          </Step>
          <Step>
            <StepLabel StepIconComponent={StepIcon}>Employment</StepLabel>
          </Step>
        </Stepper>

        <Box component="form" onSubmit={handleSubmit(doSubmit)}>
          <Box sx={{ display: 'grid', gap: { xs: 1.5, md: 2 }, gridTemplateColumns: 'repeat(12, 1fr)', alignItems: 'center' }}>
            
            <Fade in={step === 0}>
              <Box sx={{ gridColumn: step === 0 ? '1 / -1' : '1 / 1', display: step === 0 ? 'block' : 'none' }}>
                <PersonalDetailsSection control={control} />
              </Box>
            </Fade>

            <Fade in={step === 1}>
              <Box sx={{ gridColumn: step === 1 ? '1 / -1' : '1 / 1', display: step === 1 ? 'block' : 'none' }}>
                <BankingSection control={control} />
              </Box>
            </Fade>

            <Fade in={step === 2}>
              <Box sx={{ gridColumn: step === 2 ? '1 / -1' : '1 / 1', display: step === 2 ? 'block' : 'none' }}>
                <EmploymentSection control={control} />
              </Box>
            </Fade>

            <Box sx={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button onClick={prevStep} disabled={step === 0} variant="outlined">
                Previous
              </Button>
              <Stack direction="row" spacing={2}>
                <Button onClick={() => { reset(); if (onCancel) onCancel(); }} variant="text">
                  Cancel
                </Button>
                {step === 2 ? (
                  <Button type="submit" variant="contained">
                    {submitLabel}
                  </Button>
                ) : (
                  <Button onClick={nextStep} variant="contained">
                    Next
                  </Button>
                )}
              </Stack>
            </Box>
          </Box>
        </Box>
      </Paper>
    );
  }

  // Non-wizard mode - show all sections
  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, pl: { md: 4 }, mb: 2, borderRadius: 2 }} elevation={2}>
      <Box component="form" onSubmit={handleSubmit(doSubmit)}>
        <Box sx={{ display: 'grid', gap: { xs: 1.5, md: 2 }, gridTemplateColumns: 'repeat(12, 1fr)', alignItems: 'center' }}>
          
          {showHeader && (
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 0.5, borderRadius: 1, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ width: { xs: 3, md: 6 }, height: 28, borderRadius: 0.5, bgcolor: 'secondary.main' }} />
                <AccountBoxIcon fontSize="small" color="primary" />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontSize: { xs: '0.95rem', md: '1rem' }, fontWeight: 600, color: 'text.primary' }}>
                    Employee details
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
                    Create / Edit employee
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          <PersonalDetailsSection control={control} />
          <Box sx={{ gridColumn: '1 / -1' }}><Divider /></Box>
          
          <EmergencyContactSection control={control} />
          <Box sx={{ gridColumn: '1 / -1' }}><Divider /></Box>
          
          <EducationHealthTaxSection control={control} />
          <Box sx={{ gridColumn: '1 / -1' }}><Divider /></Box>
          
          <BankingSection control={control} />
          <Box sx={{ gridColumn: '1 / -1' }}><Divider /></Box>
          
          <EmploymentSection control={control} />
          <Box sx={{ gridColumn: '1 / -1' }}><Divider /></Box>
          
          <AddressSection control={control} />
          
          <Box sx={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
            <Stack direction="row" spacing={2}>
              <Button onClick={() => { reset(); if (onCancel) onCancel(); }} variant="text">
                Cancel
              </Button>
              <Button type="submit" variant="contained">
                {submitLabel}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
});

EmployeeForm.displayName = 'EmployeeForm';

export default EmployeeForm;