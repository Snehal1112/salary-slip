# Comprehensive React Application for Salary Slip Generation

Create a comprehensive React application for generating employee salary slips based on the provided salary slip template image. The app should allow users to input employee details, working days information, income components, and deductions, then automatically calculate totals and net salary, and generate a printable salary slip view that mimics the layout in the image (a tabular format with sections for company info, employee details, working days, income, deductions, and net salary).

## Tech Stack

Use the following tech stack exclusively:

- ReactJS (latest stable version as of 2025, using functional components and hooks). Incorporate any new stable features from React 19 or later if applicable (e.g., improved Suspense for loading states in forms, or React Compiler for optimization if supported in the setup).
- Redux Toolkit for state management (to handle form data, calculations, and persistence across components).
- Material-UI (MUI) component library (version 5 or later, preferably the latest in 2025) for all UI elements, styling, and theming. Apply a professional theme with colors inspired by the image (e.g., pinkish headers, clean tables).

## 2025 React Project Creation Standards

Based on 2025 standards, Create React App is officially deprecated (as announced by the React team on February 14, 2025). Instead, use modern build tools like Vite for faster development and production builds, especially for single-page applications (SPAs) like this one. Vite is recommended for its speed, native ES modules support, and simplicity. Avoid full-stack frameworks like Next.js unless server-side features are needed (not required here). If any new tools or standards emerge in 2025 (e.g., enhanced bundlers or React-specific CLIs), prioritize Vite as the baseline. Setup includes TypeScript for type safety, aligning with modern best practices.

## App Structure and Features

### 1. Project Setup

- Initialize the project with Vite using the React + TypeScript template: `npm create vite@latest salary-slip-app -- --template react-ts`.
- Install necessary dependencies: `@reduxjs/toolkit`, `react-redux`, `@types/react-redux`, `@mui/material@^5.0.0`, `@emotion/react`, `@emotion/styled`, `react-router-dom`, `react-hook-form`, `@hookform/resolvers/yup`, `yup`, `react-to-pdf`, `uuid`, `redux-persist`, `dompurify`, `@testing-library/react`, `jest`, `@types/jest`.
- Set up a Redux store with slices for employee data, working days, income, deductions, and calculations.
- Use React Router for navigation between pages (e.g., a dashboard/home, input form, preview/print page, and optionally a history page for saved slips).
- Define TypeScript interfaces for all state objects, props, and types (e.g., interface for SalaryState, IncomeItem, DeductionItem).
- Configure Vite for optimal 2025 practices: Enable any React plugins if needed (e.g., @vitejs/plugin-react), ensure hot module replacement (HMR) works, and set up production builds with code splitting.
- Include a vite.config.ts file with basic configuration (e.g., base path, plugins).

### 2. State Management with Redux Toolkit

- Create a Redux slice named `salarySlice` that manages the entire state as a single object with sections:
  - Company details: { name: string, address: string, email: string, mobile: string } (editable, with defaults from the image like "NUMERIC LABS", "abc, street, anand - 388001", "@gmail.com", "9999999999").
  - Employee details: { name: string, code: string, designation: string, pan: string, bankAccount: string, bankName: string, chequeNumber: string }.
  - Month: string (e.g., 'Apr-25').
  - Working days: { totalWorkingDays: number, daysAttended: number, leavesTaken: number, balanceLeaves: number }.
  - Income: array of objects [{ particular: string, amount: number }] for items like Basic Salary, Dearness Allowance, HRA, Tiffin Allowance, City Compensatory Allowance, Assistant Allowance, Medical Allowance. Include a totalIncome field.
  - Deductions: array of objects [{ particular: string, amount: number }] for items like PF, Professional Tax, TDS. Include a totalDeductions field.
  - Net Salary: number (calculated as totalIncome - totalDeductions).
  - Slips: array of complete salary slip objects (for multi-slip support), each with a unique ID (generated via UUID).
- Add reducers for updating each section, adding/removing income or deduction items dynamically (allow users to add custom particulars if needed, but pre-populate with the ones from the image).
- Add a reducer for calculating totals: Use `createReducer` or extraReducers to compute totalIncome, totalDeductions, and netSalary whenever income or deductions change.
- Add reducers for managing multiple slips: save new slips, load existing ones, delete slips.
- Use `createAsyncThunk` if needed for any simulated API calls (e.g., saving generated slips), but keep it simple with local state for now.
- Persist state using Redux Persist to remember data across sessions, including the array of saved slips.
- Add export/import reducers: For exporting state as JSON (using JSON.stringify) and importing it.

### 3. UI Components with MUI

- **Theme**: Create a custom MUI theme with primary color #FFC0CB (pinkish like the image headers), secondary color #FFFFFF, and typography for clean sans-serif fonts.
- **Layout**: Use MUI's Grid, Paper, and AppBar for overall structure. Include a header with company info (editable via form).
- **Dashboard/Home Page**:
  - Display options: "Generate New Slip" button (navigates to input form), "View Saved Slips" (list of saved slips with load/delete buttons, using MUI List or DataGrid).
  - Include export/import buttons for the entire state (JSON download/upload using MUI Button and hidden input).
- **Input Form Page**:
  - Use MUI TextField for all inputs (e.g., employee name, code, etc.), including a section for company details.
  - Use MUI Select or DatePicker for month selection, and add a currency selector (MUI Select with options like INR, USD) for amount formatting.
  - For working days: Number inputs with validation (e.g., daysAttended <= totalWorkingDays).
  - For income and deductions: Dynamic tables using MUI Table or DataGrid. Each row has a TextField for particular (pre-filled but editable) and amount. Include Add/Remove buttons (MUI Icons: AddIcon, DeleteIcon).
  - Display real-time calculation previews (e.g., running totals for income, deductions, net salary using MUI Typography, updated via useSelector).
  - Use MUI Button to submit the form, which dispatches updates to Redux, saves the slip, and navigates to preview.
  - Add form validation using React Hook Form with Yup schemas integrated with MUI (e.g., required fields, positive numbers for amounts, custom rules like non-negative net salary warning).
  - Add confirmation dialogs (MUI Dialog) for actions like resetting the form or adding custom items.
- **Preview/Print Page**:
  - Render a read-only view mimicking the image: Use MUI TableContainer with Table, TableHead, TableBody, TableRow, TableCell.
  - Sections: Top for company/employee info (in a Grid), then working days in a small table, then income and deductions side-by-side in columns, totals at bottom, net salary in a highlighted row.
  - Include placeholders for signatures at the bottom (e.g., empty boxes with labels).
  - Add a Print button using MUI Button that triggers window.print(), and style the page with @media print CSS to hide non-essential elements.
  - Add a PDF Export button using react-to-pdf to download the preview as a PDF (target the preview component ref).
  - Make the preview responsive but optimized for A4 print size.
- **Additional Features**:
  - Error handling: Use MUI Snackbar for notifications (e.g., "Invalid input" or "Salary generated successfully").
  - Loading states: Use MUI CircularProgress if any async operations are added.
  - Tooltips (MUI Tooltip) for fields, responsive design with MUI's useMediaQuery.
  - Optimize performance: Use React.memo or useMemo for dynamic tables.

### 4. Functionality and Logic

- All calculations should be handled in Redux reducers (e.g., sum amounts for totals).
- Format amounts as currency based on selected currency (e.g., using Intl.NumberFormat, with commas, but fallback to '-' for placeholders). Support decimal amounts (e.g., amount: number can be float).
- Handle edge cases: Zero leaves, full attendance, negative net salary (show warning via Snackbar or Dialog).
- Make the app user-friendly: Keyboard navigation, ARIA labels for accessibility.
- Sanitize inputs to prevent XSS using DOMPurify (import and use in utils for escaping user inputs like names or particulars).
- Support multi-slip: Users can generate, save, load, and manage multiple slips from the dashboard.

### 5. Best Practices

- Use ESLint and Prettier for code quality (include basic .eslintrc and .prettierrc files).
- Organize folders: src/components, src/features (for Redux slices), src/pages, src/utils (for helpers like currency formatting, input sanitization).
- Ensure accessibility: ARIA labels on MUI components, alt text for icons, screen reader support.
- Add unit/integration testing: Use @testing-library/react and jest, write tests for reducers, calculations, form submission, and rendering with sample data (include a **tests** folder with examples).
- Use Error Boundaries around major components.
- No backend integration unless specified; keep it client-side.
- Test with sample data from the image (e.g., Mr. Patel, Apr-25, all amounts as '-' placeholders initially).

### 6. Additional Output

- Generate a README.md file with instructions: How to install dependencies (npm install), run the app (npm run dev), build for production (npm run build), run tests (npm test), and any notes on features or limitations.

Generate the complete code for this app, including all files (e.g., list each file with its content in markdown code blocks for clarity), and ensure it runs without errors when set up. Structure the response by first listing the folder structure, then providing code for each file
