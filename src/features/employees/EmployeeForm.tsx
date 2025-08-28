import React from 'react'
import { Box, Button, TextField, Paper, Divider, Typography, Stack, Stepper, Step, StepLabel, Fade } from '@mui/material'
import type { StepIconProps } from '@mui/material/StepIcon'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AccountBoxIcon from '@mui/icons-material/AccountBox'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import WorkIcon from '@mui/icons-material/Work'
import { getJson, setJson, removeItem } from '../../utils/storage'
import logger from '../../utils/logger'
import { useForm, Controller } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import type { Employee } from './types'


const schema = yup.object({
  name: yup.string().required('Name is required'),
  code: yup.string().optional(),
  designation: yup.string().optional(),
  // PAN: Indian PAN format: 5 letters, 4 digits, 1 letter
  pan: yup.string().matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/i, 'Invalid PAN').nullable().optional(),
  address: yup.string().optional(),
  phone: yup.string().optional(),
  dob: yup.string().optional(),
  govId: yup.string().optional(),
  maritalStatus: yup.string().optional(),
  spouseName: yup.string().optional(),
  emergencyContactName: yup.string().optional(),
  emergencyContactPhone: yup.string().matches(/^[0-9]{10}$/, 'Enter 10 digit emergency contact').optional(),
  emergencyContactRelation: yup.string().optional(),
  department: yup.string().optional(),
  supervisor: yup.string().optional(),
  workLocation: yup.string().optional(),
  // Salary: allow numeric with optional two decimals
  salary: yup.string().matches(/^\d+(?:\.\d{1,2})?$/, 'Enter a valid salary amount').optional(),
  education: yup.string().optional(),
  taxInfo: yup.string().optional(),
  healthConditions: yup.string().optional(),
  // Bank account: digits between 6 and 22 (covers many banks)
  bankAccount: yup.string().matches(/^[0-9]{6,22}$/, 'Invalid bank account number').nullable().optional(),
  bankName: yup.string().when('bankAccount', {
    is: (val: unknown) => !!val,
    then: (s) => s.required('Bank name is required when account number provided'),
    otherwise: (s) => s.optional(),
  }),
  chequeNumber: yup.string().optional(),
  pfNumber: yup.string().matches(/^[A-Z0-9\-/]{3,20}$/i, 'Invalid PF number').optional(),
  esiNumber: yup.string().matches(/^[0-9]{1,15}$/, 'Invalid ESI number').optional(),
  joiningDate: yup.string().optional(),
  email: yup.string().email('Invalid email').optional(),
  mobile: yup.string().matches(/^[0-9]{10}$/, 'Enter 10 digit mobile').optional(),
})

type Props = {
  initial?: Partial<Employee>
  onSubmit: (e: Employee) => void
  onCancel?: () => void
  submitLabel?: string
  wizard?: boolean
  showHeader?: boolean
}

type EmployeeFormValues = {
  name: string
  code?: string
  designation?: string
  pan?: string
  address?: string
  phone?: string
  dob?: string
  govId?: string
  maritalStatus?: string
  spouseName?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelation?: string
  department?: string
  supervisor?: string
  workLocation?: string
  salary?: string
  education?: string
  taxInfo?: string
  healthConditions?: string
  bankAccount?: string
  bankName?: string
  chequeNumber?: string
  pfNumber?: string
  esiNumber?: string
  joiningDate?: string
  email?: string
  mobile?: string
}

const EmployeeForm: React.FC<Props> = ({ initial = {}, onSubmit, onCancel, submitLabel = 'Save', wizard = true, showHeader = true }) => {
  const defaultVals: EmployeeFormValues = {
    name: (initial as EmployeeFormValues)?.name ?? '',
    code: (initial as EmployeeFormValues)?.code,
    designation: (initial as EmployeeFormValues)?.designation,
    pan: (initial as EmployeeFormValues)?.pan,
    address: (initial as EmployeeFormValues)?.address,
    phone: (initial as EmployeeFormValues)?.phone,
    dob: (initial as EmployeeFormValues)?.dob,
    govId: (initial as EmployeeFormValues)?.govId,
    maritalStatus: (initial as EmployeeFormValues)?.maritalStatus,
    spouseName: (initial as EmployeeFormValues)?.spouseName,
    emergencyContactName: (initial as EmployeeFormValues)?.emergencyContactName,
    emergencyContactPhone: (initial as EmployeeFormValues)?.emergencyContactPhone,
    emergencyContactRelation: (initial as EmployeeFormValues)?.emergencyContactRelation,
    department: (initial as EmployeeFormValues)?.department,
    supervisor: (initial as EmployeeFormValues)?.supervisor,
    workLocation: (initial as EmployeeFormValues)?.workLocation,
    salary: (initial as EmployeeFormValues)?.salary,
    education: (initial as EmployeeFormValues)?.education,
    taxInfo: (initial as EmployeeFormValues)?.taxInfo,
    healthConditions: (initial as EmployeeFormValues)?.healthConditions,
    bankAccount: (initial as EmployeeFormValues)?.bankAccount,
    bankName: (initial as EmployeeFormValues)?.bankName,
    chequeNumber: (initial as EmployeeFormValues)?.chequeNumber,
    pfNumber: (initial as EmployeeFormValues)?.pfNumber,
    esiNumber: (initial as EmployeeFormValues)?.esiNumber,
    joiningDate: (initial as EmployeeFormValues)?.joiningDate,
    email: (initial as EmployeeFormValues)?.email,
    mobile: (initial as EmployeeFormValues)?.mobile,
  }

  const resolver = yupResolver(schema) as unknown as Resolver<EmployeeFormValues>
  const { control, handleSubmit, reset, watch, getValues } = useForm<EmployeeFormValues>({ resolver, defaultValues: defaultVals })

  const prevIdRef = React.useRef<string | undefined>(initial && (initial as Employee).id)
  React.useEffect(() => {
    const incomingId = initial && (initial as Employee).id
    if (incomingId !== prevIdRef.current) {
      reset({ name: '', code: '', designation: '', pan: '', bankAccount: '', bankName: '', chequeNumber: '', pfNumber: '', esiNumber: '', joiningDate: '', email: '', mobile: '', ...initial })
      prevIdRef.current = incomingId
    }
  }, [initial, reset])

  const isWizard = wizard
  const [step, setStep] = React.useState<number>(0)
  const next = () => setStep((s) => Math.min(2, s + 1))
  const back = () => setStep((s) => Math.max(0, s - 1))

  const draftKey = React.useMemo(() => `employee:draft:${(initial as Employee)?.id ?? 'new'}`, [initial])
  const timerRef = React.useRef<number | undefined>(undefined)

  React.useEffect(() => {
    const draft = getJson<EmployeeFormValues>(draftKey)
    if (draft) {
      reset({ ...defaultVals, ...draft })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey])

  React.useEffect(() => {
    const unsub = watch((value) => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => {
        setJson(draftKey, value)
      }, 300)
    })
    return () => {
      try {
        if (typeof unsub === 'function') {
          (unsub as unknown as () => void)()
        } else if (unsub && typeof (unsub as { unsubscribe?: () => void }).unsubscribe === 'function') {
          const maybe = unsub as { unsubscribe?: () => void }
          if (maybe.unsubscribe) maybe.unsubscribe()
        }
      } catch (err) {
        logger.debug('watch unsub failed', err)
      }
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [watch, draftKey])

  React.useEffect(() => {
    try { setJson(draftKey, getValues()) } catch (err) { logger.debug('save draft failed', err) }
  }, [step, draftKey, getValues])

  const StepIcon = ({ index, active, completed }: { index: number; active?: boolean; completed?: boolean }) => {
    const sx = { color: completed ? 'success.main' : active ? 'primary.main' : 'text.secondary' }
    if (completed) return <CheckCircleIcon sx={sx} />
    if (index === 0) return <AccountBoxIcon sx={sx} />
    if (index === 1) return <AccountBalanceIcon sx={sx} />
    return <WorkIcon sx={sx} />
  }

  const doSubmit = (d: EmployeeFormValues) => {
    const out = { ...(initial as Employee), ...(d as EmployeeFormValues) } as Employee
    onSubmit(out)
    try { removeItem(draftKey) } catch (err) { logger.debug('remove draft failed', err) }
  }

  if (!isWizard) {
    return (
      <Paper sx={{ p: { xs: 2, md: 3 }, pl: { md: 4 }, mb: 2, borderRadius: 2 }} elevation={2} component="form" onSubmit={handleSubmit(doSubmit)}>
        <Box sx={{ display: 'grid', gap: { xs: 1.5, md: 2 }, gridTemplateColumns: 'repeat(12, 1fr)', alignItems: 'start' }}>
          {showHeader && (
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 0.5, borderRadius: 1, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ width: { xs: 3, md: 6 }, height: 28, borderRadius: 0.5, bgcolor: 'secondary.main' }} />
                <AccountBoxIcon fontSize="small" color="primary" />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontSize: { xs: '0.95rem', md: '1rem' }, fontWeight: 600, color: 'text.primary' }}>Employee details</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>Create / Edit employee</Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Personal */}
          <Box sx={{ gridColumn: '1 / -1', mt: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Personal</Typography>
            <Box sx={{ display: 'grid', gap: { xs: 1.5, md: 2 }, gridTemplateColumns: 'repeat(12, 1fr)' }}>
              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                <Controller name="name" control={control} render={({ field }) => <TextField label="Employee Name" {...field} fullWidth size="medium" variant="outlined" />} />
              </Box>
              <Box sx={{ gridColumn: { xs: 'span 6', md: 'span 3' } }}>
                <Controller name="code" control={control} render={({ field }) => <TextField label="Code" {...field} fullWidth size="medium" variant="outlined" />} />
              </Box>
              <Box sx={{ gridColumn: { xs: 'span 6', md: 'span 3' } }}>
                <Controller name="designation" control={control} render={({ field }) => <TextField label="Designation" {...field} fullWidth size="medium" variant="outlined" />} />
              </Box>

              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                <Controller name="pan" control={control} render={({ field }) => <TextField label="PAN" {...field} fullWidth size="medium" variant="outlined" />} />
              </Box>
              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                <Controller name="dob" control={control} render={({ field }) => <TextField type="date" label="Date of Birth" InputLabelProps={{ shrink: true }} {...field} fullWidth size="medium" variant="outlined" />} />
              </Box>
              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                <Controller name="govId" control={control} render={({ field }) => <TextField label="Government ID" {...field} fullWidth size="medium" variant="outlined" />} />
              </Box>

              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                <Controller name="email" control={control} render={({ field }) => <TextField label="Email" {...field} fullWidth size="medium" variant="outlined" />} />
              </Box>
              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                <Controller name="mobile" control={control} render={({ field }) => <TextField label="Mobile" {...field} fullWidth size="medium" variant="outlined" />} />
              </Box>
              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                <Controller name="phone" control={control} render={({ field }) => <TextField label="Phone" {...field} fullWidth size="medium" variant="outlined" />} />
              </Box>
            </Box>
          </Box>

          <Box sx={{ gridColumn: '1 / -1' }}>
            <Divider />
          </Box>

          {/* Job */}
          <Box sx={{ gridColumn: '1 / -1', mt: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Job</Typography>
            <Box sx={{ display: 'grid', gap: { xs: 1.5, md: 2 }, gridTemplateColumns: 'repeat(12, 1fr)' }}>
              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                <Controller name="department" control={control} render={({ field }) => <TextField label="Department" {...field} fullWidth size="medium" variant="outlined" />} />
              </Box>
              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                <Controller name="supervisor" control={control} render={({ field }) => <TextField label="Supervisor" {...field} fullWidth size="medium" variant="outlined" />} />
              </Box>

              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                <Controller name="workLocation" control={control} render={({ field }) => <TextField label="Work Location" {...field} fullWidth size="medium" variant="outlined" />} />
              </Box>
              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                <Controller name="joiningDate" control={control} render={({ field }) => <TextField type="date" label="Joining Date" InputLabelProps={{ shrink: true }} {...field} fullWidth size="medium" variant="outlined" />} />
              </Box>

              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                <Controller name="salary" control={control} render={({ field }) => <TextField label="Salary" {...field} fullWidth size="medium" variant="outlined" />} />
              </Box>
            </Box>
          </Box>

          <Box sx={{ gridColumn: '1 / -1' }}>
            <Divider />
          </Box>

          {/* Bank & Statutory */}
          <Box sx={{ gridColumn: '1 / -1', mt: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Bank & Statutory</Typography>
            <Box sx={{ display: 'grid', gap: { xs: 1.5, md: 2 }, gridTemplateColumns: 'repeat(12, 1fr)' }}>
              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                <Controller name="bankAccount" control={control} render={({ field }) => <TextField label="Bank Account" {...field} fullWidth size="medium" variant="outlined" />} />
              </Box>
              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                <Controller name="bankName" control={control} render={({ field }) => <TextField label="Bank Name" {...field} fullWidth size="medium" variant="outlined" />} />
              </Box>
              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                <Controller name="chequeNumber" control={control} render={({ field }) => <TextField label="Cheque Number" {...field} fullWidth size="medium" variant="outlined" />} />
              </Box>

              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 3' } }}>
                <Controller name="pfNumber" control={control} render={({ field }) => <TextField label="PF Number" {...field} fullWidth size="medium" variant="outlined" />} />
              </Box>
              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 3' } }}>
                <Controller name="esiNumber" control={control} render={({ field }) => <TextField label="ESI Number" {...field} fullWidth size="medium" variant="outlined" />} />
              </Box>
            </Box>
          </Box>

          <Box sx={{ gridColumn: '1 / -1' }}>
            <Divider />
          </Box>

          {/* Emergency */}
          <Box sx={{ gridColumn: '1 / -1', mt: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Emergency Contact</Typography>
            <Box sx={{ display: 'grid', gap: { xs: 1.5, md: 2 }, gridTemplateColumns: 'repeat(12, 1fr)' }}>
              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                <Controller name="emergencyContactName" control={control} render={({ field }) => <TextField label="Emergency Contact Name" {...field} fullWidth size="medium" variant="outlined" />} />
              </Box>
              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                <Controller name="emergencyContactPhone" control={control} render={({ field }) => <TextField label="Emergency Contact Phone" {...field} fullWidth size="medium" variant="outlined" />} />
              </Box>
              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                <Controller name="emergencyContactRelation" control={control} render={({ field }) => <TextField label="Emergency Contact Relation" {...field} fullWidth size="medium" variant="outlined" />} />
              </Box>
            </Box>
          </Box>

          <Box sx={{ gridColumn: '1 / -1' }}>
            <Divider />
          </Box>

          {/* Education / Health / Tax */}
          <Box sx={{ gridColumn: '1 / -1', mt: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Education, Health & Tax</Typography>
            <Box sx={{ display: 'grid', gap: { xs: 1.5, md: 2 }, gridTemplateColumns: 'repeat(12, 1fr)' }}>
              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                <Controller name="education" control={control} render={({ field }) => <TextField label="Education" {...field} fullWidth size="medium" variant="outlined" />} />
              </Box>
              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                <Controller name="taxInfo" control={control} render={({ field }) => <TextField label="Tax & Fund Info" {...field} fullWidth size="medium" variant="outlined" />} />
              </Box>

              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 12' } }}>
                <Controller name="healthConditions" control={control} render={({ field }) => <TextField label="Health Conditions" {...field} fullWidth size="medium" variant="outlined" multiline rows={2} />} />
              </Box>
            </Box>
          </Box>

          <Box sx={{ gridColumn: '1 / -1' }}>
            <Divider />
          </Box>

          {/* Address */}
          <Box sx={{ gridColumn: '1 / -1', mt: 1 }}>
            <Box sx={{ display: 'grid', gap: { xs: 1.5, md: 2 }, gridTemplateColumns: 'repeat(12, 1fr)' }}>
              <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 12' } }}>
                <Controller name="address" control={control} render={({ field }) => <TextField label="Address" {...field} fullWidth size="medium" variant="outlined" multiline rows={2} />} />
              </Box>
            </Box>
          </Box>

          <Box sx={{ gridColumn: '1 / -1' }}>
            <Divider />
          </Box>

          <Box sx={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
            <Stack direction="row" spacing={2}>
              <Button onClick={() => { reset(); if (onCancel) { onCancel() } }} variant="text">Cancel</Button>
              <Button type="submit" variant="contained">{submitLabel}</Button>
            </Stack>
          </Box>
        </Box>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, pl: { md: 4 }, mb: 2, borderRadius: 2 }} elevation={2} component="form" onSubmit={handleSubmit(doSubmit)}>
      <Box sx={{ display: 'grid', gap: { xs: 1.5, md: 2 }, gridTemplateColumns: 'repeat(12, 1fr)', alignItems: 'center' }}>
        {showHeader && (
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 0.5, borderRadius: 1, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ width: { xs: 3, md: 6 }, height: 28, borderRadius: 0.5, bgcolor: 'secondary.main' }} />
              <AccountBoxIcon fontSize="small" color="primary" />
              <Box>
                <Typography variant="subtitle1" sx={{ fontSize: { xs: '0.95rem', md: '1rem' }, fontWeight: 600, color: 'text.primary' }}>Employee details</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>Create / Edit employee</Typography>
              </Box>
            </Box>
          </Box>
        )}

        <Box sx={{ gridColumn: '1 / -1' }}>
          <Stepper activeStep={step} alternativeLabel>
            <Step>
              <StepLabel StepIconComponent={(props: StepIconProps) => <StepIcon index={0} active={props.active} completed={props.completed} />}>Personal</StepLabel>
            </Step>
            <Step>
              <StepLabel StepIconComponent={(props: StepIconProps) => <StepIcon index={1} active={props.active} completed={props.completed} />}>Bank & Statutory</StepLabel>
            </Step>
            <Step>
              <StepLabel StepIconComponent={(props: StepIconProps) => <StepIcon index={2} active={props.active} completed={props.completed} />}>Job & Other</StepLabel>
            </Step>
          </Stepper>
        </Box>

        {/* Step 1: Identity + Contact */}
        <Fade in={step === 0}>
          <Box sx={{ gridColumn: step === 0 ? '1 / -1' : '1 / 1', display: step === 0 ? 'grid' : 'none', gap: { xs: 1.5, md: 2 }, gridTemplateColumns: 'repeat(12, 1fr)' }}>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
              <Controller name="name" control={control} render={({ field }) => <TextField label="Employee Name" {...field} fullWidth size="medium" variant="outlined" />} />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 6', md: 'span 3' } }}>
              <Controller name="code" control={control} render={({ field }) => <TextField label="Code" {...field} fullWidth size="medium" variant="outlined" />} />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 6', md: 'span 3' } }}>
              <Controller name="designation" control={control} render={({ field }) => <TextField label="Designation" {...field} fullWidth size="medium" variant="outlined" />} />
            </Box>

            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
              <Controller name="pan" control={control} render={({ field }) => <TextField label="PAN" {...field} fullWidth size="medium" variant="outlined" />} />
            </Box>

            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
              <Controller name="email" control={control} render={({ field }) => <TextField label="Email" {...field} fullWidth size="medium" variant="outlined" />} />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
              <Controller name="mobile" control={control} render={({ field }) => <TextField label="Mobile" {...field} fullWidth size="medium" variant="outlined" />} />
            </Box>
          </Box>
        </Fade>

        {/* Step 2: Bank + Statutory */}
        <Fade in={step === 1}>
          <Box sx={{ gridColumn: step === 1 ? '1 / -1' : '1 / 1', display: step === 1 ? 'grid' : 'none', gap: { xs: 1.5, md: 2 }, gridTemplateColumns: 'repeat(12, 1fr)' }}>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
              <Controller name="bankAccount" control={control} render={({ field }) => <TextField label="Bank Account" {...field} fullWidth size="medium" variant="outlined" />} />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
              <Controller name="bankName" control={control} render={({ field }) => <TextField label="Bank Name" {...field} fullWidth size="medium" variant="outlined" />} />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
              <Controller name="chequeNumber" control={control} render={({ field }) => <TextField label="Cheque Number" {...field} fullWidth size="medium" variant="outlined" />} />
            </Box>

            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
              <Controller name="pfNumber" control={control} render={({ field }) => <TextField label="PF Number" {...field} fullWidth size="medium" variant="outlined" />} />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
              <Controller name="esiNumber" control={control} render={({ field }) => <TextField label="ESI Number" {...field} fullWidth size="medium" variant="outlined" />} />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
              <Controller name="joiningDate" control={control} render={({ field }) => <TextField type="date" label="Joining Date" InputLabelProps={{ shrink: true }} {...field} fullWidth size="medium" variant="outlined" />} />
            </Box>
          </Box>
        </Fade>

        {/* Step 3: Job + Other Relevant Information */}
        <Fade in={step === 2}>
          <Box sx={{ gridColumn: step === 2 ? '1 / -1' : '1 / 1', display: step === 2 ? 'grid' : 'none', gap: { xs: 1.5, md: 2 }, gridTemplateColumns: 'repeat(12, 1fr)' }}>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
              <Controller name="department" control={control} render={({ field }) => <TextField label="Department" {...field} fullWidth size="medium" variant="outlined" />} />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
              <Controller name="supervisor" control={control} render={({ field }) => <TextField label="Supervisor" {...field} fullWidth size="medium" variant="outlined" />} />
            </Box>

            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
              <Controller name="workLocation" control={control} render={({ field }) => <TextField label="Work Location" {...field} fullWidth size="medium" variant="outlined" />} />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
              <Controller name="salary" control={control} render={({ field }) => <TextField label="Salary" {...field} fullWidth size="medium" variant="outlined" />} />
            </Box>

            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 12' } }}>
              <Controller name="address" control={control} render={({ field }) => <TextField label="Address" {...field} fullWidth size="medium" variant="outlined" multiline rows={2} />} />
            </Box>

            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
              <Controller name="govId" control={control} render={({ field }) => <TextField label="Government ID" {...field} fullWidth size="medium" variant="outlined" />} />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
              <Controller name="dob" control={control} render={({ field }) => <TextField type="date" label="Date of Birth" InputLabelProps={{ shrink: true }} {...field} fullWidth size="medium" variant="outlined" />} />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
              <Controller name="phone" control={control} render={({ field }) => <TextField label="Phone" {...field} fullWidth size="medium" variant="outlined" />} />
            </Box>

            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
              <Controller name="maritalStatus" control={control} render={({ field }) => <TextField label="Marital Status" {...field} fullWidth size="medium" variant="outlined" />} />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
              <Controller name="spouseName" control={control} render={({ field }) => <TextField label="Spouse Name" {...field} fullWidth size="medium" variant="outlined" />} />
            </Box>

            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
              <Controller name="emergencyContactName" control={control} render={({ field }) => <TextField label="Emergency Contact Name" {...field} fullWidth size="medium" variant="outlined" />} />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
              <Controller name="emergencyContactPhone" control={control} render={({ field }) => <TextField label="Emergency Contact Phone" {...field} fullWidth size="medium" variant="outlined" />} />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
              <Controller name="emergencyContactRelation" control={control} render={({ field }) => <TextField label="Emergency Contact Relation" {...field} fullWidth size="medium" variant="outlined" />} />
            </Box>

            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
              <Controller name="education" control={control} render={({ field }) => <TextField label="Education" {...field} fullWidth size="medium" variant="outlined" />} />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
              <Controller name="taxInfo" control={control} render={({ field }) => <TextField label="Tax & Fund Info" {...field} fullWidth size="medium" variant="outlined" />} />
            </Box>

            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 12' } }}>
              <Controller name="healthConditions" control={control} render={({ field }) => <TextField label="Health Conditions" {...field} fullWidth size="medium" variant="outlined" multiline rows={2} />} />
            </Box>
          </Box>
        </Fade>

        <Box sx={{ gridColumn: '1 / -1' }}>
          <Divider />
        </Box>

        <Box sx={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
          <Stack direction="row" spacing={2}>
            {step === 1 ? (
              <Button onClick={() => back()} variant="outlined">Back</Button>
            ) : (
              <Button onClick={() => { reset(); if (onCancel) { onCancel() } }} variant="text">Cancel</Button>
            )}

            {step === 0 ? (
              <Button type="button" variant="contained" onClick={() => next()}>{'Next'}</Button>
            ) : (
              <Button type="submit" variant="contained">{submitLabel}</Button>
            )}
          </Stack>
        </Box>
      </Box>
    </Paper>
  )
}

export default EmployeeForm
