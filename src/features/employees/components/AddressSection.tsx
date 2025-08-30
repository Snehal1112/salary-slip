import React from 'react';
import { Box, TextField } from '@mui/material';
import { Controller, type Control } from 'react-hook-form';
import type { Employee } from '../../../types/shared';

type Props = {
  control: Control<Employee>;
};

const AddressSection = React.memo(({ control }: Props) => (
  <Box sx={{ gridColumn: '1 / -1', mt: 1 }}>
    <Box sx={{ display: 'grid', gap: { xs: 1.5, md: 2 }, gridTemplateColumns: 'repeat(12, 1fr)' }}>
      <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 12' } }}>
        <Controller 
          name="address" 
          control={control} 
          render={({ field }) => (
            <TextField 
              label="Address" 
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

AddressSection.displayName = 'AddressSection';

export default AddressSection;