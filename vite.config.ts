import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor libraries
          'react-vendor': ['react', 'react-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux', 'redux-persist'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'yup'],
          'router-vendor': ['react-router-dom'],
          
          // PDF libraries (already dynamically imported)
          'pdf-vendor': ['html2canvas', 'jspdf'],
          
          // Utils and smaller dependencies
          'utils-vendor': ['uuid', 'dompurify']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
