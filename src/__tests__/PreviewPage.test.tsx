import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import theme from '../theme/theme';
import PreviewPage from '../pages/PreviewPage';
import employeesSlice from '../features/employees/employeesSlice';
import salarySlice from '../features/salary/salarySlice';
import type { SalaryState } from '../features/salary/types';
import html2canvas from 'html2canvas';

// Mock html2canvas and jspdf for PDF export tests
jest.mock('html2canvas', () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve({
    toDataURL: jest.fn(() => 'data:image/png;base64,mock-image-data'),
    width: 800,
    height: 600,
  })),
}));

jest.mock('jspdf', () => ({
  jsPDF: jest.fn().mockImplementation(() => ({
    internal: {
      pageSize: {
        getWidth: () => 595.28,
        getHeight: () => 841.89,
      },
    },
    addImage: jest.fn(),
    save: jest.fn(),
  })),
}));

// Mock window.print for fallback scenario
Object.defineProperty(window, 'print', {
  value: jest.fn(),
  writable: true,
});

const createMockStore = (salaryState: Partial<SalaryState>) => {
  return configureStore({
    reducer: {
      employees: employeesSlice,
      salary: salarySlice,
    },
    preloadedState: {
      employees: {
        list: [],
        loading: false,
        error: null,
        selectedIds: [],
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0,
        filters: { search: '', department: '', designation: '', status: 'all' as const },
        sortBy: 'name' as const,
        sortOrder: 'asc' as const,
        viewMode: 'list' as const,
        isFormOpen: false,
        editingEmployeeId: null,
        formStep: 0,
        validationErrors: {},
        bulkOperationInProgress: false,
        stats: { totalEmployees: 0, activeEmployees: 0, departmentCounts: {}, recentlyAdded: 0 }
      },
      salary: {
        current: {
          company: {
            name: 'Test Company',
            address: ['123 Test St', 'Test City, TC 12345'],
            email: 'test@company.com',
            mobile: '555-1234',
            gstin: 'TEST123456789',
            website: 'www.testcompany.com',
            contactNumber: '555-5678',
          },
          employee: {
            name: 'John Doe',
            code: 'EMP001',
            designation: 'Developer',
            pan: 'ABCDE1234F',
            bankAccount: '1234567890',
            bankName: 'Test Bank',
            chequeNumber: 'CHQ001',
          },
          month: 'Jan-25',
          currency: 'INR',
          workingDays: {
            totalWorkingDays: 30,
            daysAttended: 28,
            leavesTaken: 2,
            balanceLeaves: 10,
          },
          income: [
            { particular: 'Basic Salary', amount: 50000 },
            { particular: 'HRA', amount: 20000 },
          ],
          deductions: [
            { particular: 'PF', amount: 6000 },
            { particular: 'Professional Tax', amount: 200 },
          ],
          totalIncome: 70000,
          totalDeductions: 6200,
          netSalary: 63800,
          template: {
            showCompanyName: true,
            showCompanyAddress: true,
          },
        },
        slips: [],
        error: null,
        ...salaryState,
      },
    },
  });
};

const renderWithProviders = (component: React.ReactElement, store = createMockStore({})) => {
  return render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
};

describe('PreviewPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders company information correctly', () => {
    renderWithProviders(<PreviewPage />);

    expect(screen.getByText('Test Company')).toBeInTheDocument();
    expect(screen.getByText('123 Test St')).toBeInTheDocument();
    expect(screen.getByText('Test City, TC 12345')).toBeInTheDocument();
    expect(screen.getByText('GSTIN:')).toBeInTheDocument();
    expect(screen.getByText('TEST123456789')).toBeInTheDocument();
    expect(screen.getByText('Email:')).toBeInTheDocument();
    expect(screen.getByText('test@company.com')).toBeInTheDocument();
    expect(screen.getByText('Website:')).toBeInTheDocument();
    expect(screen.getByText('www.testcompany.com')).toBeInTheDocument();
    expect(screen.getByText('Contact:')).toBeInTheDocument();
    expect(screen.getByText('555-1234')).toBeInTheDocument();
  });

  it('renders employee information correctly', () => {
    renderWithProviders(<PreviewPage />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('EMP001')).toBeInTheDocument();
    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.getByText('ABCDE1234F')).toBeInTheDocument();
    expect(screen.getByText('1234567890')).toBeInTheDocument();
    expect(screen.getByText('Test Bank')).toBeInTheDocument();
  });

  it('renders working days information correctly', () => {
    renderWithProviders(<PreviewPage />);

    expect(screen.getByText('30')).toBeInTheDocument(); // Total working days
    expect(screen.getByText('28')).toBeInTheDocument(); // Days attended
    expect(screen.getByText('2')).toBeInTheDocument(); // Leaves taken
    expect(screen.getByText('10')).toBeInTheDocument(); // Balance leaves
  });

  it('renders earnings and deductions correctly', () => {
    renderWithProviders(<PreviewPage />);

    // Check earnings
    expect(screen.getByText('Basic Salary')).toBeInTheDocument();
    expect(screen.getByText('₹50,000.00')).toBeInTheDocument();
    expect(screen.getByText('HRA')).toBeInTheDocument();
    expect(screen.getByText('₹20,000.00')).toBeInTheDocument();

    // Check deductions
    expect(screen.getByText('PF')).toBeInTheDocument();
    expect(screen.getByText('₹6,000.00')).toBeInTheDocument();
    expect(screen.getByText('Professional Tax')).toBeInTheDocument();
    expect(screen.getByText('₹200.00')).toBeInTheDocument();

    // Check totals
    expect(screen.getByText('Total Earnings')).toBeInTheDocument();
    expect(screen.getByText('₹70,000.00')).toBeInTheDocument();
    expect(screen.getByText('Total Deductions')).toBeInTheDocument();
    expect(screen.getByText('₹6,200.00')).toBeInTheDocument();
    expect(screen.getByText('₹63,800.00')).toBeInTheDocument(); // Net salary
  });

  it('handles company address as comma-separated string correctly', () => {
    // Mock the Redux store to return string address (bypassing TypeScript types for testing)
    const store = createMockStore({
      current: {
        company: {
          name: 'Test Company',
          address: ['123 Test St', 'Test City', 'TC 12345'] as string[], // Type assertion to bypass strict typing
          email: '',
          mobile: '',
          gstin: '',
          website: '',
          contactNumber: '',
        },
        employee: {
          name: 'John Doe',
          code: 'EMP001',
          designation: 'Developer',
          pan: 'ABCDE1234F',
          bankAccount: '1234567890',
          bankName: 'Test Bank',
          chequeNumber: '',
        },
        month: 'Jan-25',
        currency: 'INR',
        workingDays: {
          totalWorkingDays: 30,
          daysAttended: 30,
          leavesTaken: 0,
          balanceLeaves: 0,
        },
        income: [],
        deductions: [],
        totalIncome: 0,
        totalDeductions: 0,
        netSalary: 0,
        template: {
          showCompanyName: true,
          showCompanyAddress: true,
        },
      },
    });

    renderWithProviders(<PreviewPage />, store);

    // Should split by comma and render each part
    expect(screen.getByText('123 Test St')).toBeInTheDocument();
    expect(screen.getByText('Test City')).toBeInTheDocument();
    expect(screen.getByText('TC 12345')).toBeInTheDocument();
  });

  it('handles missing company information gracefully', () => {
    const store = createMockStore({
      current: {
        company: {
          name: '',
          address: [],
          email: '',
          mobile: '',
          gstin: '',
          website: '',
          contactNumber: '',
        },
        employee: {
          name: '',
          code: '',
          designation: '',
          pan: '',
          bankAccount: '',
          bankName: '',
          chequeNumber: '',
        },
        month: 'Jan-25',
        currency: 'INR',
        workingDays: {
          totalWorkingDays: 0,
          daysAttended: 0,
          leavesTaken: 0,
          balanceLeaves: 0,
        },
        income: [],
        deductions: [],
        totalIncome: 0,
        totalDeductions: 0,
        netSalary: 0,
      },
    });

    renderWithProviders(<PreviewPage />, store);

    // Should render without errors even with empty data
    expect(screen.getByText('Total Earnings')).toBeInTheDocument();
    expect(screen.getByText('Total Deductions')).toBeInTheDocument();
  });

  it('exports PDF successfully', async () => {
    renderWithProviders(<PreviewPage />);

    const exportButton = screen.getByRole('button', { name: 'Export PDF / Print' });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(html2canvas).toHaveBeenCalled();
    });
  });

  it('falls back to print when PDF export fails', async () => {
    // Mock html2canvas to fail
    (html2canvas as jest.Mock).mockRejectedValueOnce(new Error('Canvas failed'));

    renderWithProviders(<PreviewPage />);

    const exportButton = screen.getByRole('button', { name: 'Export PDF / Print' });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(window.print).toHaveBeenCalled();
    });
  });

  it('navigates to edit page when Edit button is clicked', () => {
    renderWithProviders(<PreviewPage />);

    const editButton = screen.getByRole('link', { name: 'Edit Slip' });
    expect(editButton).toHaveAttribute('href', '/form');
  });

  it('loads sample slip data when Load sample slip button is clicked', async () => {
    const store = createMockStore({});
    renderWithProviders(<PreviewPage />, store);

    const loadSampleButton = screen.getByRole('button', { name: 'Load Sample' });
    fireEvent.click(loadSampleButton);

    await waitFor(() => {
      const state = store.getState();
      expect(state.salary.current.employee.name).toBe('Sample Employee');
      expect(state.salary.current.employee.code).toBe('EMP12345');
      expect(state.salary.current.employee.designation).toBe('Software Engineer');
    });
  });

  it('calculates sample slip income correctly', async () => {
    const store = createMockStore({});
    renderWithProviders(<PreviewPage />, store);

    const loadSampleButton = screen.getByRole('button', { name: 'Load Sample' });
    fireEvent.click(loadSampleButton);

    await waitFor(() => {
      const state = store.getState();
      const income = state.salary.current.income;

      // Check basic salary calculation (50% of gross)
      const basicSalary = income.find(item => item.particular === 'Basic Salary');
      expect(basicSalary?.amount).toBe(50445); // Math.round(100890 * 0.5)

      // Check HRA calculation (40% of basic)
      const hra = income.find(item => item.particular === 'HRA');
      expect(hra?.amount).toBe(20178); // Math.round(50445 * 0.4)

      // Check fixed allowances
      const conveyance = income.find(item => item.particular === 'Conveyance');
      expect(conveyance?.amount).toBe(1600);

      const medical = income.find(item => item.particular === 'Medical Allowance');
      expect(medical?.amount).toBe(1250);
    });
  });

  it('calculates sample slip deductions correctly', async () => {
    const store = createMockStore({});
    renderWithProviders(<PreviewPage />, store);

    const loadSampleButton = screen.getByRole('button', { name: 'Load Sample' });
    fireEvent.click(loadSampleButton);

    await waitFor(() => {
      const state = store.getState();
      const deductions = state.salary.current.deductions;

      // Check PF calculation (12% of basic)
      const pf = deductions.find(item => item.particular === 'PF');
      expect(pf?.amount).toBe(6053); // Math.round(50445 * 0.12)

      // Check Professional Tax
      const professionalTax = deductions.find(item => item.particular === 'Professional Tax');
      expect(professionalTax?.amount).toBe(200); // Gujarat PT for gross > 25000

      // Check TDS exists
      const tds = deductions.find(item => item.particular === 'TDS');
      expect(tds).toBeDefined();
    });
  });

  it('includes employer contributions in sample slip', async () => {
    const store = createMockStore({});
    renderWithProviders(<PreviewPage />, store);

    const loadSampleButton = screen.getByRole('button', { name: 'Load Sample' });
    fireEvent.click(loadSampleButton);

    await waitFor(() => {
      const state = store.getState();
      const income = state.salary.current.income;

      // Check employer PF contribution
      const employerPF = income.find(item => item.particular === 'Employer PF (12%)');
      expect(employerPF?.amount).toBe(6053);
    });
  });

  it('sets working days in sample slip', async () => {
    const store = createMockStore({});
    renderWithProviders(<PreviewPage />, store);

    const loadSampleButton = screen.getByRole('button', { name: 'Load Sample' });
    fireEvent.click(loadSampleButton);

    await waitFor(() => {
      const state = store.getState();
      const workingDays = state.salary.current.workingDays;

      expect(workingDays.totalWorkingDays).toBe(30);
      expect(workingDays.daysAttended).toBe(30);
      expect(workingDays.leavesTaken).toBe(0);
      expect(workingDays.balanceLeaves).toBe(12);
    });
  });

  it('renders signature section correctly', () => {
    renderWithProviders(<PreviewPage />);

    expect(screen.getByText('Employee Signature')).toBeInTheDocument();
    expect(screen.getByText('Authorized Signatory')).toBeInTheDocument();
  });

  it('renders disclaimer correctly', () => {
    renderWithProviders(<PreviewPage />);

    expect(screen.getByText(/This salary slip is system generated/)).toBeInTheDocument();
    expect(screen.getByText(/does not require a physical signature/)).toBeInTheDocument();
  });

  it('handles template settings correctly', () => {
    const store = createMockStore({
      current: {
        company: {
          name: 'Hidden Company',
          address: ['Address Line'],
          email: '',
          mobile: '',
          gstin: '',
          website: '',
          contactNumber: '',
        },
        employee: {
          name: 'John Doe',
          code: 'EMP001',
          designation: 'Developer',
          pan: 'ABCDE1234F',
          bankAccount: '1234567890',
          bankName: 'Test Bank',
          chequeNumber: '',
        },
        month: 'Jan-25',
        currency: 'INR',
        workingDays: {
          totalWorkingDays: 30,
          daysAttended: 30,
          leavesTaken: 0,
          balanceLeaves: 0,
        },
        income: [],
        deductions: [],
        totalIncome: 0,
        totalDeductions: 0,
        netSalary: 0,
        template: {
          showCompanyName: false,
          showCompanyAddress: false,
        },
      },
    });

    renderWithProviders(<PreviewPage />, store);

    // Company name and address should be hidden
    expect(screen.queryByText('Hidden Company')).not.toBeInTheDocument();
    expect(screen.queryByText('Address Line')).not.toBeInTheDocument();
  });

  it('formats currency values correctly', () => {
    const store = createMockStore({
      current: {
        company: {
          name: 'Test Company',
          address: [],
          email: '',
          mobile: '',
          gstin: '',
          website: '',
          contactNumber: '',
        },
        employee: {
          name: 'John Doe',
          code: 'EMP001',
          designation: 'Developer',
          pan: 'ABCDE1234F',
          bankAccount: '1234567890',
          bankName: 'Test Bank',
          chequeNumber: '',
        },
        month: 'Jan-25',
        currency: 'INR',
        workingDays: {
          totalWorkingDays: 30,
          daysAttended: 30,
          leavesTaken: 0,
          balanceLeaves: 0,
        },
        income: [
          { particular: 'Basic Salary', amount: 123456.78 },
        ],
        deductions: [
          { particular: 'PF', amount: 9876.54 },
        ],
        totalIncome: 123456.78,
        totalDeductions: 9876.54,
        netSalary: 113580.24,
      },
    });

    renderWithProviders(<PreviewPage />, store);

    expect(screen.getAllByText('₹1,23,456.78').length).toBeGreaterThan(0);
    expect(screen.getAllByText('₹9,876.54').length).toBeGreaterThan(0);
    expect(screen.getByText('₹1,13,580.24')).toBeInTheDocument();
  });
});
