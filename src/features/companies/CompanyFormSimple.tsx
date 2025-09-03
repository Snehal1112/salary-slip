import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Business as BusinessIcon,
} from '@mui/icons-material';
import type { Company } from '../../types/shared';

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

  useEffect(() => {
    if (initial) {
      setFormData(initial);
    }
  }, [initial]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }

    if (!formData.addresses[0]?.line1?.trim()) {
      newErrors.addressLine1 = 'Address line 1 is required';
    }

    if (!formData.addresses[0]?.city?.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.addresses[0]?.state?.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.addresses[0]?.pincode?.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.addresses[0].pincode)) {
      newErrors.pincode = 'Invalid pincode format';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    if (formData.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin)) {
      newErrors.gstin = 'Invalid GSTIN format';
    }

    if (formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) {
      newErrors.pan = 'Invalid PAN format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

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
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {showHeader && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessIcon />
            {initial ? 'Edit Company' : 'Add New Company'}
          </Typography>
        </Box>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Basic Information */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Basic Information
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Company Name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                fullWidth
                error={!!errors.name}
                helperText={errors.name}
              />
              <TextField
                label="Email Address"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                fullWidth
                error={!!errors.email}
                helperText={errors.email}
              />
              <TextField
                label="Phone Number"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                fullWidth
                error={!!errors.phone}
                helperText={errors.phone}
                placeholder="10 digit number"
              />
              <TextField
                label="Website"
                value={formData.website || ''}
                onChange={(e) => handleChange('website', e.target.value)}
                fullWidth
              />
            </Stack>
          </Paper>

          {/* Address */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Primary Address
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Address Line 1"
                value={formData.addresses[0]?.line1 || ''}
                onChange={(e) => handleChange('address.line1', e.target.value)}
                required
                fullWidth
                error={!!errors.addressLine1}
                helperText={errors.addressLine1}
              />
              <TextField
                label="Address Line 2"
                value={formData.addresses[0]?.line2 || ''}
                onChange={(e) => handleChange('address.line2', e.target.value)}
                fullWidth
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  label="City"
                  value={formData.addresses[0]?.city || ''}
                  onChange={(e) => handleChange('address.city', e.target.value)}
                  required
                  error={!!errors.city}
                  helperText={errors.city}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="State"
                  value={formData.addresses[0]?.state || ''}
                  onChange={(e) => handleChange('address.state', e.target.value)}
                  required
                  error={!!errors.state}
                  helperText={errors.state}
                  sx={{ flex: 1 }}
                />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Pincode"
                  value={formData.addresses[0]?.pincode || ''}
                  onChange={(e) => handleChange('address.pincode', e.target.value)}
                  required
                  error={!!errors.pincode}
                  helperText={errors.pincode}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Country"
                  value={formData.addresses[0]?.country || 'India'}
                  onChange={(e) => handleChange('address.country', e.target.value)}
                  required
                  sx={{ flex: 1 }}
                />
              </Stack>
            </Stack>
          </Paper>

          {/* Government Registration Numbers */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Registration Numbers
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="GSTIN Number"
                value={formData.gstin || ''}
                onChange={(e) => handleChange('gstin', e.target.value)}
                fullWidth
                error={!!errors.gstin}
                helperText={errors.gstin}
                placeholder="15 characters"
              />
              <TextField
                label="PAN Number"
                value={formData.pan || ''}
                onChange={(e) => handleChange('pan', e.target.value)}
                fullWidth
                error={!!errors.pan}
                helperText={errors.pan}
                placeholder="10 characters"
              />
              <TextField
                label="TAN Number"
                value={formData.tan || ''}
                onChange={(e) => handleChange('tan', e.target.value)}
                fullWidth
                placeholder="10 characters"
              />
              <TextField
                label="CIN Number"
                value={formData.cin || ''}
                onChange={(e) => handleChange('cin', e.target.value)}
                fullWidth
              />
            </Stack>
          </Paper>

          {/* Other Registration Numbers */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Other Registration Numbers
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="PF Registration Number"
                value={formData.pfRegistrationNumber || ''}
                onChange={(e) => handleChange('pfRegistrationNumber', e.target.value)}
                fullWidth
              />
              <TextField
                label="ESI Registration Number"
                value={formData.esiRegistrationNumber || ''}
                onChange={(e) => handleChange('esiRegistrationNumber', e.target.value)}
                fullWidth
              />
              <TextField
                label="PT Registration Number"
                value={formData.ptRegistrationNumber || ''}
                onChange={(e) => handleChange('ptRegistrationNumber', e.target.value)}
                fullWidth
              />
            </Stack>
          </Paper>

          {/* Status */}
          <Paper sx={{ p: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                />
              }
              label="Company is Active"
            />
          </Paper>

          {/* Error Display */}
          {Object.keys(errors).length > 0 && (
            <Alert severity="error">
              Please fix the errors above before submitting.
            </Alert>
          )}

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ minWidth: 140 }}
            >
              {submitLabel}
            </Button>
          </Box>
        </Stack>
      </form>
    </Box>
  );
};

export default CompanyFormSimple;