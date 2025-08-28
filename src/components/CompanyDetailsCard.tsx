import React from 'react';
import { Box, Typography, Paper, TextField, IconButton, Button } from '@mui/material';
import { useForm, useFieldArray } from 'react-hook-form';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

export interface CompanyDetailsForm {
  name: string;
  address: string[];
  mobile?: string;
  gstin?: string;
  email?: string;
  website?: string;
}

type AddressField = { value: string };

interface Props {
  value: CompanyDetailsForm;
  onChange: (data: CompanyDetailsForm) => void;
}

// type AddressForm = { address: string[] };

const CompanyDetailsCard: React.FC<Props> = ({ value, onChange }) => {
  // Convert string[] to AddressField[] for local form
  const addressObjects: AddressField[] = value.address?.length
    ? value.address.map((line) => ({ value: line }))
    : [{ value: "" }];

  const { control, register, watch } = useForm<{ address: AddressField[] }>({
    defaultValues: { address: addressObjects },
  });
  const { fields: addressFields, append, remove } = useFieldArray<{ address: AddressField[] }>({ control, name: 'address' });

  // Watch for address changes and sync with parent
  React.useEffect(() => {
    const watched = watch('address') as AddressField[];
    onChange({ ...value, address: watched.map((a) => a.value) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch('address')]);

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Company Details</Typography>
      <TextField label="Company Name" variant="outlined" fullWidth size="medium" sx={{ mb: 2 }} value={value.name} onChange={e => onChange({ ...value, name: e.target.value })} />
      {addressFields.map((field, idx) => (
        <Box key={field.id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField label={`Address Line ${idx + 1}`} variant="outlined" fullWidth size="medium" {...register(`address.${idx}.value`)} />
          <IconButton sx={{ ml: 1 }} onClick={() => remove(idx)} disabled={addressFields.length === 1} aria-label="Remove address line">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}
      <Button startIcon={<AddIcon />} onClick={() => append({ value: "" })} size="small" variant="text" color="primary" sx={{ textTransform: 'none', fontWeight: 700, mb: 2 }}>Add Address Line</Button>
      <TextField label="GSTIN" variant="outlined" fullWidth size="medium" sx={{ mb: 2 }} value={value.gstin || ''} onChange={e => onChange({ ...value, gstin: e.target.value })} />
      <TextField label="Email" variant="outlined" fullWidth size="medium" sx={{ mb: 2 }} value={value.email || ''} onChange={e => onChange({ ...value, email: e.target.value })} />
      <TextField label="Website" variant="outlined" fullWidth size="medium" sx={{ mb: 2 }} value={value.website || ''} onChange={e => onChange({ ...value, website: e.target.value })} />
      <TextField label="Contact Number" variant="outlined" fullWidth size="medium" sx={{ mb: 2 }} value={value.mobile || ''} onChange={e => onChange({ ...value, mobile: e.target.value })} />
    </Paper>
  );
};

export default CompanyDetailsCard;
