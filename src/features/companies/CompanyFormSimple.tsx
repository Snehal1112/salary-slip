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

      <Box id="main-content" sx={{ maxWidth: 800, mx: 'auto' }} role="main" aria-label="Company information form">
        {showHeader && (
          <header role="banner">
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon aria-hidden="true" />
                {initial ? 'Edit Company Information' : 'Add New Company Information'}
              </Typography>

              {/* Progress indicator */}
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Form Progress: {formProgress}% complete
                  </Typography>
                  <Stack direction="row" spacing={1}>
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
                  </Stack>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={formProgress}
                  sx={{ height: 6, borderRadius: 3 }}
                  aria-label={`Form completion progress: ${formProgress} percent`}
                />
              </Box>
            </Box>
          </header>
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
          <Stack spacing={3} role="form" aria-label="Company registration form">
            {/* Basic Information */}
            <Paper sx={{ p: 3 }} component="section" aria-labelledby="basic-info-heading">
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }} id="basic-info-heading">
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
              elevation={2}
              sx={{
                p: 4,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  elevation: 4,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                }
              }}
              component="section"
              aria-labelledby="address-heading"
            >
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 3,
                pb: 2,
                borderBottom: '2px solid',
                borderColor: completedSections.includes('address') ? 'success.main' : 'divider'
              }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', flex: 1 }} id="address-heading">
                  📍 Primary Address
                </Typography>
                {completedSections.includes('address') && (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Completed"
                    color="success"
                    variant="filled"
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                    aria-label="Section completed"
                  />
                )}
              </Box>
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

            {/* Government Registration Numbers */}
            <Paper
              elevation={2}
              sx={{
                p: 4,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  elevation: 4,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                }
              }}
              component="section"
              aria-labelledby="registration-heading"
            >
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 3,
                pb: 2,
                borderBottom: '2px solid',
                borderColor: completedSections.includes('registration') ? 'success.main' : 'divider'
              }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', flex: 1 }} id="registration-heading">
                  📏 Government Registration
                </Typography>
                {completedSections.includes('registration') && (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Completed"
                    color="success"
                    variant="filled"
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                    aria-label="Section completed"
                  />
                )}
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontStyle: 'italic' }}>
                📄 Optional: Enter government registration numbers for compliance and tax purposes.
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
              elevation={2}
              sx={{
                p: 4,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  elevation: 4,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                }
              }}
              component="section"
              aria-labelledby="other-heading"
            >
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 3,
                pb: 2,
                borderBottom: '2px solid',
                borderColor: completedSections.includes('other') ? 'success.main' : 'divider'
              }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', flex: 1 }} id="other-heading">
                  👥 Employee Benefits
                </Typography>
                {completedSections.includes('other') && (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Completed"
                    color="success"
                    variant="filled"
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                    aria-label="Section completed"
                  />
                )}
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontStyle: 'italic' }}>
                🔒 Optional: Registration numbers for employee benefits and statutory compliance.
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
            <Paper
              elevation={2}
              sx={{
                p: 4,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  elevation: 4,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                }
              }}
              component="section"
              aria-labelledby="status-heading"
            >
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 3,
                pb: 2,
                borderBottom: '2px solid',
                borderColor: 'divider'
              }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', flex: 1 }} id="status-heading">
                  ⚙️ Company Status
                </Typography>
              </Box>

              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                p: 3,
                border: '2px solid',
                borderColor: formData.isActive ? 'success.main' : 'grey.300',
                borderRadius: 2,
                backgroundColor: formData.isActive ? 'success.50' : 'grey.50',
                transition: 'all 0.3s ease'
              }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => handleChange('isActive', e.target.checked)}
                      inputProps={{
                        'aria-describedby': 'status-help',
                      }}
                      sx={{
                        '& .MuiSwitch-thumb': {
                          width: 28,
                          height: 28,
                        },
                        '& .MuiSwitch-track': {
                          borderRadius: 15,
                        }
                      }}
                    />
                  }
                  label={
                    <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 1 }}>
                      {formData.isActive ? '✅ Company is Active' : '❌ Company is Inactive'}
                    </Typography>
                  }
                />
              </Box>
              <Typography variant="body1" color="text.secondary" id="status-help" sx={{ mt: 2, fontStyle: 'italic' }}>
                📝 {formData.isActive
                  ? 'Active companies can be used for salary slip generation and are visible in all company lists.'
                  : 'Inactive companies are archived and cannot be used for new salary slips.'}
              </Typography>
            </Paper>

            {/* Error Display */}
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
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                border: '1px solid',
                borderColor: 'divider',
                position: 'sticky',
                bottom: 0,
                zIndex: 10
              }}
              component="section"
              aria-label="Form actions"
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={3}
                sx={{ justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    Ready to {initial ? 'update' : 'save'} your company information?
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {totalErrors > 0
                      ? `🚫 Please fix ${totalErrors} error${totalErrors > 1 ? 's' : ''} above`
                      : `✓ All information looks good`
                    }
                  </Typography>
                </Box>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    onClick={onCancel}
                    size="large"
                    sx={{
                      minWidth: 120,
                      fontWeight: 'bold',
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'translateY(-1px)'
                      }
                    }}
                    aria-describedby="cancel-help"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={totalErrors > 0}
                    sx={{
                      minWidth: 160,
                      fontWeight: 'bold',
                      py: 1.5,
                      boxShadow: totalErrors > 0 ? 'none' : '0 4px 15px rgba(25, 118, 210, 0.4)',
                      '&:hover': {
                        transform: totalErrors > 0 ? 'none' : 'translateY(-2px)',
                        boxShadow: totalErrors > 0 ? 'none' : '0 6px 20px rgba(25, 118, 210, 0.6)'
                      },
                      '&:disabled': {
                        backgroundColor: 'grey.300',
                        color: 'grey.500'
                      }
                    }}
                    aria-describedby={totalErrors > 0 ? 'submit-disabled-help' : 'submit-help'}
                  >
                    {submitLabel} 🚀
                  </Button>
                </Stack>
              </Stack>

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
          </Stack>
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
