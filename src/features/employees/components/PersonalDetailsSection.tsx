import React from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { Controller, type Control } from 'react-hook-form';
import type { Employee } from '../../../types/shared';

type Props = {
  control: Control<Employee>;
};

const PersonalDetailsSection = React.memo(({ control }: Props) => (
  <Box sx={{ gridColumn: '1 / -1', mt: 1 }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Personal</Typography>
    <Box sx={{ display: 'grid', gap: { xs: 1.5, md: 2 }, gridTemplateColumns: 'repeat(12, 1fr)' }}>
      <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
        <Controller 
          name="name" 
          control={control} 
          render={({ field }) => (
            <TextField 
              label="Employee Name" 
              {...field} 
              fullWidth 
              size="medium" 
              variant="outlined" 
            />
          )} 
        />
      </Box>
      <Box sx={{ gridColumn: { xs: 'span 6', md: 'span 3' } }}>
        <Controller 
          name="code" 
          control={control} 
          render={({ field }) => (
            <TextField 
              label="Code" 
              {...field} 
              fullWidth 
              size="medium" 
              variant="outlined" 
            />
          )} 
        />
      </Box>
      <Box sx={{ gridColumn: { xs: 'span 6', md: 'span 3' } }}>
        <Controller 
          name="designation" 
          control={control} 
          render={({ field }) => (
            <TextField 
              label="Designation" 
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
          name="pan" 
          control={control} 
          render={({ field }) => (
            <TextField 
              label="PAN" 
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
          name="dob" 
          control={control} 
          render={({ field }) => (
            <TextField 
              type="date" 
              label="Date of Birth" 
              InputLabelProps={{ shrink: true }} 
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
          name="govId" 
          control={control} 
          render={({ field }) => (
            <TextField 
              label="Government ID" 
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
          name="email" 
          control={control} 
          render={({ field }) => (
            <TextField 
              label="Email" 
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
          name="mobile" 
          control={control} 
          render={({ field }) => (
            <TextField 
              label="Mobile" 
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
          name="phone" 
          control={control} 
          render={({ field }) => (
            <TextField 
              label="Phone" 
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

PersonalDetailsSection.displayName = 'PersonalDetailsSection';

export default PersonalDetailsSection;