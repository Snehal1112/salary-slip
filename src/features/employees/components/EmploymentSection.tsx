import React from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { Controller, type Control } from 'react-hook-form';
import type { Employee } from '../../../types/shared';
import WorkIcon from '@mui/icons-material/Work';

type Props = {
  control: Control<Employee>;
};

const EmploymentSection = React.memo(({ control }: Props) => (
  <Box sx={{ gridColumn: '1 / -1', mt: 1 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <WorkIcon fontSize="small" color="primary" />
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Employment Details</Typography>
    </Box>
    <Box sx={{ display: 'grid', gap: { xs: 1.5, md: 2 }, gridTemplateColumns: 'repeat(12, 1fr)' }}>
      <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
        <Controller 
          name="department" 
          control={control} 
          render={({ field }) => (
            <TextField 
              label="Department" 
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
          name="supervisor" 
          control={control} 
          render={({ field }) => (
            <TextField 
              label="Supervisor" 
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
          name="workLocation" 
          control={control} 
          render={({ field }) => (
            <TextField 
              label="Work Location" 
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
          name="salary" 
          control={control} 
          render={({ field }) => (
            <TextField 
              label="Salary" 
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

EmploymentSection.displayName = 'EmploymentSection';

export default EmploymentSection;