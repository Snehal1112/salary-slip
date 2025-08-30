import React from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { Controller, type Control } from 'react-hook-form';
import type { Employee } from '../../../types/shared';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

type Props = {
  control: Control<Employee>;
};

const BankingSection = React.memo(({ control }: Props) => (
  <Box sx={{ gridColumn: '1 / -1', mt: 1 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <AccountBalanceIcon fontSize="small" color="primary" />
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Banking Details</Typography>
    </Box>
    <Box sx={{ display: 'grid', gap: { xs: 1.5, md: 2 }, gridTemplateColumns: 'repeat(12, 1fr)' }}>
      <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
        <Controller 
          name="bankAccount" 
          control={control} 
          render={({ field }) => (
            <TextField 
              label="Bank Account" 
              {...field} 
              fullWidth 
              size="medium" 
              variant="outlined" 
            />
          )} 
        />
      </Box>
      <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
        <Controller 
          name="bankName" 
          control={control} 
          render={({ field }) => (
            <TextField 
              label="Bank Name" 
              {...field} 
              fullWidth 
              size="medium" 
              variant="outlined" 
            />
          )} 
        />
      </Box>
      <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
        <Controller 
          name="chequeNumber" 
          control={control} 
          render={({ field }) => (
            <TextField 
              label="Cheque Number" 
              {...field} 
              fullWidth 
              size="medium" 
              variant="outlined" 
            />
          )} 
        />
      </Box>
      <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
        <Controller 
          name="pfNumber" 
          control={control} 
          render={({ field }) => (
            <TextField 
              label="PF Number" 
              {...field} 
              fullWidth 
              size="medium" 
              variant="outlined" 
            />
          )} 
        />
      </Box>
      <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
        <Controller 
          name="esiNumber" 
          control={control} 
          render={({ field }) => (
            <TextField 
              label="ESI Number" 
              {...field} 
              fullWidth 
              size="medium" 
              variant="outlined" 
            />
          )} 
        />
      </Box>
      <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
        <Controller 
          name="joiningDate" 
          control={control} 
          render={({ field }) => (
            <TextField 
              type="date" 
              label="Joining Date" 
              InputLabelProps={{ shrink: true }} 
              {...field} 
              fullWidth 
              size="medium" 
              variant="outlined" 
            />
          )} 
        />
      </Box>
    </Box>
  </Box>
));

BankingSection.displayName = 'BankingSection';

export default BankingSection;