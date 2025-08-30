import React from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { Controller, type Control } from 'react-hook-form';
import type { Employee } from '../../../types/shared';

type Props = {
  control: Control<Employee>;
};

const EmergencyContactSection = React.memo(({ control }: Props) => (
  <Box sx={{ gridColumn: '1 / -1', mt: 1 }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Emergency Contact</Typography>
    <Box sx={{ display: 'grid', gap: { xs: 1.5, md: 2 }, gridTemplateColumns: 'repeat(12, 1fr)' }}>
      <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
        <Controller 
          name="emergencyContactName" 
          control={control} 
          render={({ field }) => (
            <TextField 
              label="Emergency Contact Name" 
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
          name="emergencyContactPhone" 
          control={control} 
          render={({ field }) => (
            <TextField 
              label="Emergency Contact Phone" 
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
          name="emergencyContactRelation" 
          control={control} 
          render={({ field }) => (
            <TextField 
              label="Emergency Contact Relation" 
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

EmergencyContactSection.displayName = 'EmergencyContactSection';

export default EmergencyContactSection;