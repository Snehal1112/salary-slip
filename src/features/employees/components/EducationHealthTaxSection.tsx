import React from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { Controller, type Control } from 'react-hook-form';
import type { Employee } from '../../../types/shared';

type Props = {
  control: Control<Employee>;
};

const EducationHealthTaxSection = React.memo(({ control }: Props) => (
  <Box sx={{ gridColumn: '1 / -1', mt: 1 }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Education, Health & Tax</Typography>
    <Box sx={{ display: 'grid', gap: { xs: 1.5, md: 2 }, gridTemplateColumns: 'repeat(12, 1fr)' }}>
      <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
        <Controller 
          name="education" 
          control={control} 
          render={({ field }) => (
            <TextField 
              label="Education" 
              {...field} 
              fullWidth 
              size="medium" 
              variant="outlined" 
            />
          )} 
        />
      </Box>
      <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
        <Controller 
          name="taxInfo" 
          control={control} 
          render={({ field }) => (
            <TextField 
              label="Tax & Fund Info" 
              {...field} 
              fullWidth 
              size="medium" 
              variant="outlined" 
            />
          )} 
        />
      </Box>
      <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 12' } }}>
        <Controller 
          name="healthConditions" 
          control={control} 
          render={({ field }) => (
            <TextField 
              label="Health Conditions" 
              {...field} 
              fullWidth 
              size="medium" 
              variant="outlined" 
              multiline 
              rows={2} 
            />
          )} 
        />
      </Box>
    </Box>
  </Box>
));

EducationHealthTaxSection.displayName = 'EducationHealthTaxSection';

export default EducationHealthTaxSection;