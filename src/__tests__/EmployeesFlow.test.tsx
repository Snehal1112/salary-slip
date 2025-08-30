import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import EmployeesPage from '../pages/EmployeesPage';
import { BrowserRouter } from 'react-router-dom';
import salaryReducer from '../features/salary/salarySlice';
import employeesReducer from '../features/employees/employeesSlice';

// Mock useNavigate to prevent navigation errors in tests
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams()],
}));

// Create a fresh store for each test to avoid state pollution
const createTestStore = () => configureStore({
  reducer: {
    salary: salaryReducer,
    employees: employeesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable for testing
    }),
});

const renderWithProviders = (component: React.ReactElement) => {
  const store = createTestStore();
  return {
    store,
    ...render(
      <Provider store={store}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </Provider>
    )
  };
};

describe('EmployeesFlow', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  afterEach(() => {
    // Clean up any localStorage drafts between tests
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('employee:draft:')) {
        localStorage.removeItem(key);
      }
    });
  });

  test('ADD Employee button shows and hides form correctly', async () => {
    renderWithProviders(<EmployeesPage />);

    // Initially, form should be hidden
    expect(screen.queryByLabelText(/Employee Name/i)).not.toBeInTheDocument();
    
    // Find and click ADD Employee button
    const addEmployeeButton = screen.getByRole('button', { name: /Add Employee/i });
    expect(addEmployeeButton).toBeInTheDocument();
    fireEvent.click(addEmployeeButton);
    
    // Form should now be visible
    await waitFor(() => {
      expect(screen.getByLabelText(/Employee Name/i)).toBeInTheDocument();
    });
    
    // Cancel should hide form
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);
    
    await waitFor(() => {
      expect(screen.queryByLabelText(/Employee Name/i)).not.toBeInTheDocument();
    });
  });

  test('empty state shows Add Your First Employee button', async () => {
    renderWithProviders(<EmployeesPage />);

    // Should show empty state message
    expect(screen.getByText(/No employees added yet/i)).toBeInTheDocument();
    
    // Should show "Add Your First Employee" button
    const firstEmployeeButton = screen.getByRole('button', { name: /Add Your First Employee/i });
    expect(firstEmployeeButton).toBeInTheDocument();
    
    // Clicking should show form
    fireEvent.click(firstEmployeeButton);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Employee Name/i)).toBeInTheDocument();
    });
  });

  test('form hides after successful employee addition', async () => {
    const { store } = renderWithProviders(<EmployeesPage />);

    // Show form
    const addEmployeeButton = screen.getByRole('button', { name: /Add Employee/i });
    fireEvent.click(addEmployeeButton);
    
    // Fill form and submit
    await waitFor(() => {
      expect(screen.getByLabelText(/Employee Name/i)).toBeInTheDocument();
    });
    
    const nameInput = screen.getByLabelText(/Employee Name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Employee' } });
    
    const addButtons = screen.getAllByRole('button', { name: /Add Employee/i });
    const submitButton = addButtons.find((button) => (button as HTMLButtonElement).type === 'submit')!;
    fireEvent.click(submitButton);
    
    // Form should be hidden after successful submission
    await waitFor(() => {
      expect(screen.queryByLabelText(/Employee Name/i)).not.toBeInTheDocument();
    });
    
    // Employee should be added to store
    await waitFor(() => {
      const state = store.getState();
      expect(state.employees.list.length).toBe(1);
    });
  });

  test('selecting Use on employee updates Redux state and navigates correctly', async () => {
    const { store } = renderWithProviders(<EmployeesPage />);

    // Show form first
    const addEmployeeButton = screen.getByRole('button', { name: /Add Employee/i });
    fireEvent.click(addEmployeeButton);

    // Add an employee
    await waitFor(() => {
      expect(screen.getByLabelText(/Employee Name/i)).toBeInTheDocument();
    });
    
    const nameInput = screen.getByLabelText(/Employee Name/i);
    fireEvent.change(nameInput, { target: { value: 'Alice Johnson' } });
    
    const addButtons = screen.getAllByRole('button', { name: /Add Employee/i });
    const submitButton = addButtons.find((button) => (button as HTMLButtonElement).type === 'submit')!;
    fireEvent.click(submitButton);

    // Wait for employee to be added to store first
    await waitFor(() => {
      const state = store.getState();
      expect(state.employees.list.length).toBe(1);
    }, { timeout: 3000 });

    // Wait for employee to appear in list and click Use
    const useButton = await screen.findByRole('button', { name: /Use/i });
    fireEvent.click(useButton);

    // Verify Redux state is updated with employee data
    await waitFor(() => {
      const state = store.getState();
      expect(state.salary.current.employee.name).toBe('Alice Johnson');
    }, { timeout: 3000 });
    
    // Verify navigation was called with correct route
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('/form?employeeId='));
  });

  test('adding employee updates employees list correctly', async () => {
    const { store } = renderWithProviders(<EmployeesPage />);

    // Initially no employees should be in the store
    expect(store.getState().employees.list.length).toBe(0);
    expect(screen.queryByRole('button', { name: /Use/i })).not.toBeInTheDocument();

    // Show form first
    const addEmployeeButton = screen.getByRole('button', { name: /Add Employee/i });
    fireEvent.click(addEmployeeButton);

    // Add an employee with multiple fields
    await waitFor(() => {
      expect(screen.getByLabelText(/Employee Name/i)).toBeInTheDocument();
    });
    
    const nameInput = screen.getByLabelText(/Employee Name/i);
    const codeInput = screen.getByLabelText(/Code/i);
    const designationInput = screen.getByLabelText(/Designation/i);
    
    fireEvent.change(nameInput, { target: { value: 'Bob Smith' } });
    fireEvent.change(codeInput, { target: { value: 'EMP002' } });
    fireEvent.change(designationInput, { target: { value: 'Developer' } });
    
    const addButtons = screen.getAllByRole('button', { name: /Add Employee/i });
    const submitButton = addButtons.find((button) => (button as HTMLButtonElement).type === 'submit')!;
    fireEvent.click(submitButton);

    // Verify employee was added to Redux store
    await waitFor(() => {
      const state = store.getState();
      expect(state.employees.list.length).toBe(1);
      expect(state.employees.list[0].name).toBe('Bob Smith');
      expect(state.employees.list[0].code).toBe('EMP002');
      expect(state.employees.list[0].designation).toBe('Developer');
    }, { timeout: 3000 });

    // Verify Use button appears
    const useButton = await screen.findByRole('button', { name: /Use/i });
    expect(useButton).toBeInTheDocument();
    
    // Verify employee name is visible in the list
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
  });

  test('employee form handles minimum required data correctly', async () => {
    const { store } = renderWithProviders(<EmployeesPage />);

    // Show form first
    const addEmployeeButton = screen.getByRole('button', { name: /Add Employee/i });
    fireEvent.click(addEmployeeButton);

    // Add employee with just required name field
    await waitFor(() => {
      expect(screen.getByLabelText(/Employee Name/i)).toBeInTheDocument();
    });
    
    const nameInput = screen.getByLabelText(/Employee Name/i);
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    
    const addButtons = screen.getAllByRole('button', { name: /Add Employee/i });
    const submitButton = addButtons.find((button) => (button as HTMLButtonElement).type === 'submit')!;
    fireEvent.click(submitButton);

    // Verify employee was added with name and optional fields as undefined/empty
    await waitFor(() => {
      const state = store.getState();
      expect(state.employees.list.length).toBe(1);
      expect(state.employees.list[0].name).toBe('Jane Doe');
      expect(state.employees.list[0].code).toBeFalsy(); // Could be undefined or empty string
    }, { timeout: 3000 });

    // Use the employee
    const useButton = await screen.findByRole('button', { name: /Use/i });
    fireEvent.click(useButton);

    // Verify employee data is set in salary state
    await waitFor(() => {
      const state = store.getState();
      expect(state.salary.current.employee.name).toBe('Jane Doe');
    }, { timeout: 3000 });
  });

  test('employee list displays added employees correctly', async () => {
    const { store } = renderWithProviders(<EmployeesPage />);

    // Show form first
    const addEmployeeButton = screen.getByRole('button', { name: /Add Employee/i });
    fireEvent.click(addEmployeeButton);

    // Add multiple employees
    await waitFor(() => {
      expect(screen.getByLabelText(/Employee Name/i)).toBeInTheDocument();
    });
    
    const nameInput = screen.getByLabelText(/Employee Name/i);
    const codeInput = screen.getByLabelText(/Code/i);
    
    // First employee
    fireEvent.change(nameInput, { target: { value: 'Employee One' } });
    fireEvent.change(codeInput, { target: { value: 'EMP001' } });
    
    const addButtons = screen.getAllByRole('button', { name: /Add Employee/i });
    const submitButton = addButtons.find((button) => (button as HTMLButtonElement).type === 'submit')!;
    fireEvent.click(submitButton);

    // Verify first employee was added
    await waitFor(() => {
      expect(store.getState().employees.list.length).toBe(1);
      expect(screen.getByText('Employee One')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Show form again for second employee 
    const addEmployeeButton2 = screen.getByRole('button', { name: /Add Employee/i });
    fireEvent.click(addEmployeeButton2);
    
    // Wait for form to show again
    await waitFor(() => {
      expect(screen.getByLabelText(/Employee Name/i)).toBeInTheDocument();
    });
    
    // Clear form and add second employee
    const nameInput2 = screen.getByLabelText(/Employee Name/i);
    const codeInput2 = screen.getByLabelText(/Code/i);
    fireEvent.change(nameInput2, { target: { value: 'Employee Two' } });
    fireEvent.change(codeInput2, { target: { value: 'EMP002' } });
    
    const addButtons2 = screen.getAllByRole('button', { name: /Add Employee/i });
    const submitButton2 = addButtons2.find((button) => (button as HTMLButtonElement).type === 'submit')!;
    fireEvent.click(submitButton2);

    // Verify both employees are in state and UI
    await waitFor(() => {
      const state = store.getState();
      expect(state.employees.list.length).toBe(2);
      expect(state.employees.list.map(e => e.name)).toContain('Employee One');
      expect(state.employees.list.map(e => e.name)).toContain('Employee Two');
    }, { timeout: 3000 });

    // Verify UI shows both employees
    expect(screen.getByText('Employee One')).toBeInTheDocument();
    expect(screen.getByText('Employee Two')).toBeInTheDocument();
    
    // Should have two Use buttons
    const useButtons = screen.getAllByRole('button', { name: /Use/i });
    expect(useButtons).toHaveLength(2);
  });
});