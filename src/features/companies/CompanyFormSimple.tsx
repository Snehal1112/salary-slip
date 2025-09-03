import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  FormControlLabel,
  Switch,
  Alert,
  LinearProgress,
  Chip,
  Fab,
} from '@mui/material';
import {
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';
import type { Company } from '../../types/shared';

// Screen reader only styles
const srOnlyStyles = {
  position: 'absolute' as const,
  left: '-10000px',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(1px, 1px, 1px, 1px)',
  whiteSpace: 'nowrap' as const,
};

interface CompanyFormProps {
  initial?: Company;
  onSubmit: (data: Company) => void;
  onCancel: () => void;
  submitLabel?: string;
  showHeader?: boolean;
}

const CompanyFormSimple: React.FC<CompanyFormProps> = ({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Save Company',
  showHeader = true,
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const errorAnnouncementRef = useRef<HTMLDivElement>(null);
  const skipLinkRef = useRef<HTMLAnchorElement>(null);
  const [formData, setFormData] = useState<Company>({
    name: '',
    addresses: [{
      id: 'addr1',
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      isPrimary: true,
    }],
    gstin: '',
    pan: '',
    tan: '',
    cin: '',
    email: '',
    phone: '',
    website: '',
    pfRegistrationNumber: '',
    esiRegistrationNumber: '',
    ptRegistrationNumber: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  useEffect(() => {
    if (initial) {
      setFormData(initial);
    }
  }, [initial]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required. Please enter a valid company name.';
    }

    if (!formData.addresses[0]?.line1?.trim()) {
      newErrors.addressLine1 = 'Address line 1 is required. Please enter the primary address.';
    }

    if (!formData.addresses[0]?.city?.trim()) {
      newErrors.city = 'City is required. Please enter the city name.';
    }

    if (!formData.addresses[0]?.state?.trim()) {
      newErrors.state = 'State is required. Please enter the state or province.';
    }

    if (!formData.addresses[0]?.pincode?.trim()) {
      newErrors.pincode = 'Pincode is required. Please enter a 6-digit postal code.';
    } else if (!/^\d{6}$/.test(formData.addresses[0].pincode)) {
      newErrors.pincode = 'Invalid pincode format. Please enter exactly 6 digits.';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format. Please enter a valid email address.';
    }

    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format. Please enter exactly 10 digits.';
    }

    if (formData.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin)) {
      newErrors.gstin = 'Invalid GSTIN format. Please enter a valid 15-character GSTIN number.';
    }

    if (formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) {
      newErrors.pan = 'Invalid PAN format. Please enter a valid 10-character PAN number.';
    }

    setErrors(newErrors);

    // Announce errors to screen readers
    if (Object.keys(newErrors).length > 0 && errorAnnouncementRef.current) {
      const errorCount = Object.keys(newErrors).length;
      const announcement = `Form validation failed. ${errorCount} error${errorCount > 1 ? 's' : ''} found. Please review and correct the highlighted fields.`;
      errorAnnouncementRef.current.textContent = announcement;
    }

    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    } else {
      // Focus first error field for keyboard users
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField && formRef.current) {
        const fieldMapping: Record<string, string> = {
          name: 'input[aria-label*="Company Name"]',
          email: 'input[aria-label*="Email"]',
          phone: 'input[aria-label*="Phone"]',
          addressLine1: 'input[aria-label*="Address Line 1"]',
          city: 'input[aria-label*="City"]',
          state: 'input[aria-label*="State"]',
          pincode: 'input[aria-label*="Pincode"]',
          gstin: 'input[aria-label*="GSTIN"]',
          pan: 'input[aria-label*="PAN"]',
        };

        const selector = fieldMapping[firstErrorField] || `input[name="${firstErrorField}"]`;
        const firstErrorElement = formRef.current.querySelector(selector) as HTMLElement;
        if (firstErrorElement) {
          firstErrorElement.focus();
        }
      }
    }
  }, [formData, onSubmit, validateForm, errors]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to submit form
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        const submitButton = formRef.current?.querySelector('button[type="submit"]') as HTMLButtonElement;
        if (submitButton && !submitButton.disabled) {
          handleSubmit(e as unknown as React.FormEvent);
        }
      }

      // Escape to cancel
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, handleSubmit]);

  const updateSectionProgress = useCallback(() => {
    const sections = {
      basic: formData.name && formData.email,
      address: formData.addresses[0]?.line1 && formData.addresses[0]?.city &&
        formData.addresses[0]?.state && formData.addresses[0]?.pincode,
      registration: true, // Optional fields
      other: true, // Optional fields
    };

    const completed = Object.entries(sections)
      .filter(([, isComplete]) => isComplete)
      .map(([section]) => section);

    setCompletedSections(completed);
  }, [formData.name, formData.email, formData.addresses]);

  const handleChange = (field: string, value: string | boolean) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        addresses: [{ ...prev.addresses[0], [addressField]: value }]
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Clear specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Update section progress
    setTimeout(updateSectionProgress, 0);
  };

  const formProgress = Math.round((completedSections.length / 4) * 100);
  const totalErrors = Object.keys(errors).filter(key => errors[key]).length;

  useEffect(() => {
    updateSectionProgress();
  }, [formData, updateSectionProgress]);

  return (
    <>
      {/* Skip navigation link */}
      <a
        ref={skipLinkRef}
        href="#main-content"
        style={{
          ...srOnlyStyles,
          ':focus': {
            position: 'fixed',
            top: '10px',
            left: '10px',
            zIndex: 9999,
            padding: '8px 16px',
            backgroundColor: '#1976d2',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            width: 'auto',
            height: 'auto',
            overflow: 'visible',
            clip: 'auto',
          },
        } as React.CSSProperties}
        onFocus={(e) => {
          e.currentTarget.style.position = 'fixed';
          e.currentTarget.style.top = '10px';
          e.currentTarget.style.left = '10px';
          e.currentTarget.style.zIndex = '9999';
          e.currentTarget.style.padding = '8px 16px';
          e.currentTarget.style.backgroundColor = '#1976d2';
          e.currentTarget.style.color = 'white';
          e.currentTarget.style.textDecoration = 'none';
          e.currentTarget.style.borderRadius = '4px';
          e.currentTarget.style.width = 'auto';
          e.currentTarget.style.height = 'auto';
          e.currentTarget.style.overflow = 'visible';
          e.currentTarget.style.clip = 'auto';
        }}
        onBlur={(e) => {
          Object.assign(e.currentTarget.style, srOnlyStyles);
        }}
      >
        Skip to main content
      </a>

      <Box
        id="main-content"
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          p: { xs: 2, sm: 0 },
          minHeight: '100vh'
        }}
        role="main"
        aria-label="Company information form"
      >
        {showHeader && (
          <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }} component="header" role="banner">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <BusinessIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {initial ? 'Edit Company Information' : 'Add Company Information'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {initial ? 'Update your company details' : 'Set up your company profile'}
                </Typography>
              </Box>
            </Box>

            {/* Progress Section */}
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Form Completion
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formProgress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={formProgress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3
                  }
                }}
                aria-label={`Form completion progress: ${formProgress} percent`}
              />

              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {['basic', 'address', 'registration', 'other'].map((section) => (
                  <Chip
                    key={section}
                    label={section.charAt(0).toUpperCase() + section.slice(1)}
                    icon={completedSections.includes(section) ? <CheckCircleIcon /> : undefined}
                    variant={completedSections.includes(section) ? 'filled' : 'outlined'}
                    color={completedSections.includes(section) ? 'success' : 'default'}
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          </Paper>
        )}

        {/* Screen reader announcements */}
        <div
          ref={errorAnnouncementRef}
          aria-live="polite"
          aria-atomic="true"
          style={srOnlyStyles}
        />

        {/* Keyboard shortcuts help */}
        <div style={srOnlyStyles}>
          Keyboard shortcuts: Ctrl+Enter to submit, Escape to cancel, Tab to navigate between fields
        </div>

        <form onSubmit={handleSubmit} ref={formRef} noValidate>
          {/* Two-column layout container */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
              gap: { xs: 4, lg: 6 },
              alignItems: 'start'
            }}
            role="form"
            aria-label="Company registration form"
          >
            {/* Left Column */}
            <Stack spacing={4} sx={{ gridColumn: { xs: 'span 1', lg: '1' } }}>
              {/* Basic Information */}
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }} component="section" aria-labelledby="basic-info-heading">
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }} id="basic-info-heading">
                  Basic Information
                  {completedSections.includes('basic') && (
                    <CheckCircleIcon sx={{ ml: 1, color: 'success.main', fontSize: '1.2em' }} aria-label="Section completed" />
                  )}
                </Typography>
                <Stack spacing={2} role="group" aria-labelledby="basic-info-heading">
                  <TextField
                    label="Company Name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    inputProps={{
                      'aria-required': 'true',
                      'aria-invalid': !!errors.name,
                    }}
                  />
                  <TextField
                    label="Email Address"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email || 'Optional: Primary contact email for the company'}
                    aria-describedby={errors.email ? 'email-error' : 'email-help'}
                    inputProps={{
                      'aria-invalid': !!errors.email,
                      autoComplete: 'email',
                    }}
                  />
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                    <TextField
                      label="Phone Number"
                      value={formData.phone || ''}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      fullWidth
                      error={!!errors.phone}
                      helperText={errors.phone || 'Optional: 10-digit phone number'}
                      placeholder="10 digit number"
                      aria-describedby={errors.phone ? 'phone-error' : 'phone-help'}
                      inputProps={{
                        'aria-invalid': !!errors.phone,
                        autoComplete: 'tel',
                        pattern: '[0-9]{10}',
                      }}
                    />
                    <TextField
                      label="Website"
                      value={formData.website || ''}
                      onChange={(e) => handleChange('website', e.target.value)}
                      fullWidth
                      helperText="Optional: Company website URL"
                      aria-describedby="website-help"
                      inputProps={{
                        autoComplete: 'url',
                        type: 'url',
                      }}
                    />
                  </Stack>
                </Stack>
              </Paper>

              {/* Address */}
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 2
                }}
                component="section"
                aria-labelledby="address-heading"
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }} id="address-heading">
                  Primary Address
                  {completedSections.includes('address') && (
                    <CheckCircleIcon sx={{ ml: 1, color: 'success.main', fontSize: '1.2em' }} aria-label="Section completed" />
                  )}
                </Typography>
                <Stack spacing={3} role="group" aria-labelledby="address-heading">
                  <TextField
                    label="Address Line 1"
                    value={formData.addresses[0]?.line1 || ''}
                    onChange={(e) => handleChange('address.line1', e.target.value)}
                    required
                    fullWidth
                    error={!!errors.addressLine1}
                    helperText={errors.addressLine1}
                    aria-describedby={errors.addressLine1 ? 'address-line1-error' : undefined}
                    inputProps={{
                      'aria-required': 'true',
                      'aria-invalid': !!errors.addressLine1,
                      autoComplete: 'address-line1',
                    }}
                  />
                  <TextField
                    label="Address Line 2"
                    value={formData.addresses[0]?.line2 || ''}
                    onChange={(e) => handleChange('address.line2', e.target.value)}
                    fullWidth
                    helperText="Optional: Apartment, suite, or building details"
                    aria-describedby="address-line2-help"
                    inputProps={{
                      autoComplete: 'address-line2',
                    }}
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                    <TextField
                      label="City"
                      value={formData.addresses[0]?.city || ''}
                      onChange={(e) => handleChange('address.city', e.target.value)}
                      required
                      error={!!errors.city}
                      helperText={errors.city}
                      sx={{ flex: 1 }}
                      aria-describedby={errors.city ? 'city-error' : undefined}
                      inputProps={{
                        'aria-required': 'true',
                        'aria-invalid': !!errors.city,
                        autoComplete: 'address-level2',
                      }}
                    />
                    <TextField
                      label="State"
                      value={formData.addresses[0]?.state || ''}
                      onChange={(e) => handleChange('address.state', e.target.value)}
                      required
                      error={!!errors.state}
                      helperText={errors.state}
                      sx={{ flex: 1 }}
                      aria-describedby={errors.state ? 'state-error' : undefined}
                      inputProps={{
                        'aria-required': 'true',
                        'aria-invalid': !!errors.state,
                        autoComplete: 'address-level1',
                      }}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                    <TextField
                      label="Pincode"
                      value={formData.addresses[0]?.pincode || ''}
                      onChange={(e) => handleChange('address.pincode', e.target.value)}
                      required
                      error={!!errors.pincode}
                      helperText={errors.pincode}
                      sx={{ flex: 1 }}
                      aria-describedby={errors.pincode ? 'pincode-error' : undefined}
                      inputProps={{
                        'aria-required': 'true',
                        'aria-invalid': !!errors.pincode,
                        autoComplete: 'postal-code',
                        pattern: '[0-9]{6}',
                        maxLength: 6,
                      }}
                    />
                    <TextField
                      label="Country"
                      value={formData.addresses[0]?.country || 'India'}
                      onChange={(e) => handleChange('address.country', e.target.value)}
                      required
                      sx={{ flex: 1 }}
                      helperText="Default: India"
                      aria-describedby="country-help"
                      inputProps={{
                        'aria-required': 'true',
                        autoComplete: 'country-name',
                      }}
                    />
                  </Stack>
                </Stack>
              </Paper>
            </Stack>

            {/* Right Column */}
            <Stack spacing={4} sx={{ gridColumn: { xs: 'span 1', lg: '2' } }}>
              {/* Government Registration Numbers */}
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 2
                }}
                component="section"
                aria-labelledby="registration-heading"
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }} id="registration-heading">
                  Government Registration
                  {completedSections.includes('registration') && (
                    <CheckCircleIcon sx={{ ml: 1, color: 'success.main', fontSize: '1.2em' }} aria-label="Section completed" />
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Optional: Enter government registration numbers for compliance and tax purposes.
                </Typography>
                <Stack spacing={3} role="group" aria-labelledby="registration-heading">
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                    <TextField
                      label="GSTIN Number"
                      value={formData.gstin || ''}
                      onChange={(e) => handleChange('gstin', e.target.value)}
                      fullWidth
                      error={!!errors.gstin}
                      helperText={errors.gstin || 'Optional: 15-character GST ID'}
                      placeholder="22ABCDE1234F1Z5"
                      aria-describedby={errors.gstin ? 'gstin-error' : 'gstin-help'}
                      inputProps={{
                        'aria-invalid': !!errors.gstin,
                        maxLength: 15,
                        style: { textTransform: 'uppercase', fontFamily: 'monospace' },
                      }}
                    />
                    <TextField
                      label="PAN Number"
                      value={formData.pan || ''}
                      onChange={(e) => handleChange('pan', e.target.value)}
                      fullWidth
                      error={!!errors.pan}
                      helperText={errors.pan || 'Optional: 10-character PAN'}
                      placeholder="ABCDE1234F"
                      aria-describedby={errors.pan ? 'pan-error' : 'pan-help'}
                      inputProps={{
                        'aria-invalid': !!errors.pan,
                        maxLength: 10,
                        style: { textTransform: 'uppercase', fontFamily: 'monospace' },
                      }}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                    <TextField
                      label="TAN Number"
                      value={formData.tan || ''}
                      onChange={(e) => handleChange('tan', e.target.value)}
                      fullWidth
                      placeholder="ABCD12345E"
                      helperText="Optional: Tax Deduction Account Number"
                      aria-describedby="tan-help"
                      inputProps={{
                        maxLength: 10,
                        style: { textTransform: 'uppercase', fontFamily: 'monospace' },
                      }}
                    />
                    <TextField
                      label="CIN Number"
                      value={formData.cin || ''}
                      onChange={(e) => handleChange('cin', e.target.value)}
                      fullWidth
                      helperText="Optional: Corporate Identity Number"
                      aria-describedby="cin-help"
                      inputProps={{
                        style: { textTransform: 'uppercase', fontFamily: 'monospace' },
                      }}
                    />
                  </Stack>
                </Stack>
              </Paper>

              {/* Other Registration Numbers */}
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 2
                }}
                component="section"
                aria-labelledby="other-heading"
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }} id="other-heading">
                  Employee Benefits
                  {completedSections.includes('other') && (
                    <CheckCircleIcon sx={{ ml: 1, color: 'success.main', fontSize: '1.2em' }} aria-label="Section completed" />
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Optional: Registration numbers for employee benefits and statutory compliance.
                </Typography>
                <Stack spacing={3} role="group" aria-labelledby="other-heading">
                  <TextField
                    label="PF Registration Number"
                    value={formData.pfRegistrationNumber || ''}
                    onChange={(e) => handleChange('pfRegistrationNumber', e.target.value)}
                    fullWidth
                    helperText="Optional: Provident Fund registration number for employee benefits"
                    aria-describedby="pf-help"
                  />
                  <TextField
                    label="ESI Registration Number"
                    value={formData.esiRegistrationNumber || ''}
                    onChange={(e) => handleChange('esiRegistrationNumber', e.target.value)}
                    fullWidth
                    helperText="Optional: Employee State Insurance registration number"
                    aria-describedby="esi-help"
                  />
                  <TextField
                    label="PT Registration Number"
                    value={formData.ptRegistrationNumber || ''}
                    onChange={(e) => handleChange('ptRegistrationNumber', e.target.value)}
                    fullWidth
                    helperText="Optional: Professional Tax registration number"
                    aria-describedby="pt-help"
                  />
                </Stack>
              </Paper>

              {/* Status */}
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }} component="section" aria-labelledby="status-heading">
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }} id="status-heading">
                  Company Status
                </Typography>

                <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, backgroundColor: 'grey.50' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isActive}
                        onChange={(e) => handleChange('isActive', e.target.checked)}
                        inputProps={{ 'aria-describedby': 'status-help' }}
                      />
                    }
                    label={
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formData.isActive ? 'Company is Active' : 'Company is Inactive'}
                      </Typography>
                    }
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" id="status-help" sx={{ mt: 2 }}>
                  {formData.isActive
                    ? 'Active companies can be used for salary slip generation and are visible in all company lists.'
                    : 'Inactive companies are archived and cannot be used for new salary slips.'}
                </Typography>
              </Paper>
            </Stack>
          </Box>

          {/* Error Display - Full width */}
          {Object.keys(errors).length > 0 && (
            <Alert
              severity="error"
              role="alert"
              aria-live="polite"
              icon={<ErrorIcon aria-hidden="true" />}
            >
              <Typography variant="body1" component="div" sx={{ fontWeight: 'bold' }}>
                Form Validation Errors ({totalErrors} error{totalErrors > 1 ? 's' : ''})
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Please review and correct the highlighted fields before submitting the form.
              </Typography>
              <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                {Object.entries(errors).filter(([, error]) => error).map(([field, error]) => (
                  <li key={field} style={{ marginBottom: '4px' }}>
                    <strong>{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {error}
                  </li>
                ))}
              </ul>
            </Alert>
          )}

          {/* Actions */}
          <Paper variant="outlined" sx={{ p: 3, mt: 3, borderRadius: 2 }} component="section" aria-label="Form actions">
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {totalErrors > 0 ? 'Please fix errors to continue' : 'Ready to save'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {totalErrors > 0
                    ? `Please review the highlighted fields above and correct ${totalErrors} error${totalErrors > 1 ? 's' : ''} before proceeding.`
                    : `All required information has been provided. You're ready to ${initial ? 'update' : 'create'} your company profile.`
                  }
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, minWidth: { xs: '100%', sm: 'auto' } }}>
                <Button
                  variant="outlined"
                  onClick={onCancel}
                  size="large"
                  sx={{ minWidth: { xs: '100%', sm: 120 } }}
                  aria-describedby="cancel-help"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={totalErrors > 0}
                  sx={{ minWidth: { xs: '100%', sm: 140 } }}
                  aria-describedby={totalErrors > 0 ? 'submit-disabled-help' : 'submit-help'}
                >
                  {totalErrors > 0 ? 'Fix Errors First' : submitLabel}
                </Button>
              </Box>
            </Box>

            {/* Hidden helper texts for screen readers */}
            <div style={srOnlyStyles}>
              <div id="cancel-help">
                Cancel form and return to previous page without saving changes
              </div>
              <div id="submit-help">
                Save company information and proceed
              </div>
              <div id="submit-disabled-help">
                Submit button is disabled due to form validation errors. Please fix the errors first.
              </div>
            </div>
          </Paper>
        </form>

        {/* Scroll to top button - appears when scrolled down */}
        <Fab
          size="small"
          color="primary"
          aria-label="Scroll to top of form"
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
        >
          <KeyboardArrowUpIcon />
        </Fab>
      </Box>
    </>
  );
};

export default CompanyFormSimple;
