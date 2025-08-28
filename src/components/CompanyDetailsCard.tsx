import React from 'react';
import { Box, Typography, Paper, TextField, IconButton, Button } from '@mui/material';
// ...existing code...
import type { UseFormReturn } from 'react-hook-form';
import type { FormValues } from '../features/salary/types';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

interface Props {
  form: UseFormReturn<FormValues>;
}

const CompanyDetailsCard: React.FC<Props> = ({ form }) => {
  const { register, setValue, getValues } = form;
  const address: string[] = getValues('company.address') || [''];

  const handleAddAddress = () => {
    setValue('company.address', [...address, '']);
  };

  const handleRemoveAddress = (idx: number) => {
    if (address.length > 1) {
      setValue('company.address', address.filter((_, i) => i !== idx));
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Company Details</Typography>
      <TextField label="Company Name" variant="outlined" fullWidth size="medium" sx={{ mb: 2 }} {...register('company.name')} />
      {address.map((line, idx) => (
        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField label={`Address Line ${idx + 1}`} variant="outlined" fullWidth size="medium" {...register(`company.address.${idx}`)} defaultValue={line} />
          <IconButton sx={{ ml: 1 }} onClick={() => handleRemoveAddress(idx)} disabled={address.length === 1} aria-label="Remove address line">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}
      <Button startIcon={<AddIcon />} onClick={handleAddAddress} size="small" variant="text" color="primary" sx={{ textTransform: 'none', fontWeight: 700, mb: 2 }}>Add Address Line</Button>
      <TextField label="GSTIN" variant="outlined" fullWidth size="medium" sx={{ mb: 2 }} {...register('company.gstin')} />
      <TextField label="Email" variant="outlined" fullWidth size="medium" sx={{ mb: 2 }} {...register('company.email')} />
      <TextField label="Website" variant="outlined" fullWidth size="medium" sx={{ mb: 2 }} {...register('company.website')} />
      <TextField label="Contact Number" variant="outlined" fullWidth size="medium" sx={{ mb: 2 }} {...register('company.mobile')} />
    </Paper>
  );
};

export default CompanyDetailsCard;
