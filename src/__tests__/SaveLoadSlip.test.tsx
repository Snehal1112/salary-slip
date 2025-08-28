import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from '../store'
import FormPage from '../pages/FormPage'
import { BrowserRouter } from 'react-router-dom'
import { setCompany, setEmployee, setWorkingDays, setIncome, setDeductions, saveSlip } from '../features/salary/salarySlice'

test('save slip persists to store and can be previewed', async () => {
  render(
    <Provider store={store}>
      <BrowserRouter>
        <FormPage />
      </BrowserRouter>
    </Provider>,
  )

  // Fill required fields
  const companyNameInputs = screen.getAllByLabelText(/Company Name/i)
  const companyNameInput = companyNameInputs.find(el => el.tagName === 'INPUT')
  await act(async () => {
    fireEvent.change(companyNameInput!, { target: { value: 'Test Company' } })
  });

  const addressLine1 = screen.getByLabelText(/Address Line 1/i)
  await act(async () => {
    fireEvent.change(addressLine1, { target: { value: '123 Main St' } })
  });

  const employeeName = screen.getByLabelText(/Employee Name/i)
  await act(async () => {
    fireEvent.change(employeeName, { target: { value: 'Test Employee' } })
  });

  const totalWorkingDays = screen.getByLabelText(/Total Working Days/i)
  await act(async () => {
    fireEvent.change(totalWorkingDays, { target: { value: '30' } })
  });

  const daysAttended = screen.getByLabelText(/Number of Working Days Attended/i)
  await act(async () => {
    fireEvent.change(daysAttended, { target: { value: '30' } })
  });

  const leavesTaken = screen.getByLabelText(/Leaves Taken/i)
  await act(async () => {
    fireEvent.change(leavesTaken, { target: { value: '0' } })
  });

  const balanceLeaves = screen.getByLabelText(/Balance Leaves/i)
  await act(async () => {
    fireEvent.change(balanceLeaves, { target: { value: '0' } })
  });

  // Find all textboxes (inputs) and spinbuttons (number inputs)
  const textboxes = screen.getAllByRole('textbox');
  const spinbuttons = screen.getAllByRole('spinbutton');

  // Fill all rendered income fields
  const incomeParticulars = textboxes.filter(inp => (inp as HTMLInputElement).name.match(/^income\.[0-9]+\.particular$/));
  const incomeAmounts = spinbuttons.filter(inp => (inp as HTMLInputElement).name.match(/^income\.[0-9]+\.amount$/));
  for (let i = 0; i < incomeParticulars.length; i++) {
    if (incomeParticulars[i] && incomeParticulars[i].tagName === 'INPUT') {
      await act(async () => {
        fireEvent.change(incomeParticulars[i], { target: { value: `Income${i + 1}` } });
      });
    }
    if (incomeAmounts[i] && incomeAmounts[i].tagName === 'INPUT') {
      await act(async () => {
        fireEvent.change(incomeAmounts[i], { target: { value: `${1000 + i * 100}` } });
      });
    }
  }
  // Fill all rendered deduction fields
  const deductionParticulars = textboxes.filter(inp => (inp as HTMLInputElement).name.match(/^deductions\.[0-9]+\.particular$/));
  const deductionAmounts = spinbuttons.filter(inp => (inp as HTMLInputElement).name.match(/^deductions\.[0-9]+\.amount$/));
  for (let i = 0; i < deductionParticulars.length; i++) {
    if (deductionParticulars[i] && deductionParticulars[i].tagName === 'INPUT') {
      await act(async () => {
        fireEvent.change(deductionParticulars[i], { target: { value: `Deduction${i + 1}` } });
      });
    }
    if (deductionAmounts[i] && deductionAmounts[i].tagName === 'INPUT') {
      await act(async () => {
        fireEvent.change(deductionAmounts[i], { target: { value: `${100 + i * 10}` } });
      });
    }
  }

  // Wait for state updates
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  // Update Redux store with form data before saving
  await act(async () => {
    store.dispatch(setCompany({
      name: 'Test Company',
      address: ['123 Main St'],
      email: '',
      mobile: '',
      gstin: '',
      website: ''
    }));
    store.dispatch(setEmployee({
      name: 'Test Employee',
      code: '',
      designation: '',
      pan: '',
      bankAccount: '',
      bankName: '',
      chequeNumber: ''
    }));
    store.dispatch(setWorkingDays({
      totalWorkingDays: 30,
      daysAttended: 30,
      leavesTaken: 0,
      balanceLeaves: 0
    }));
    // Set income and deductions with test data
    const incomeData = Array.from({ length: incomeParticulars.length }, (_, i) => ({
      particular: `Income${i + 1}`,
      amount: 1000 + i * 100
    }));
    const deductionData = Array.from({ length: deductionParticulars.length }, (_, i) => ({
      particular: `Deduction${i + 1}`,
      amount: 100 + i * 10
    }));
    store.dispatch(setIncome(incomeData));
    store.dispatch(setDeductions(deductionData));
  });

  // Save slip directly using Redux action
  await act(async () => {
    store.dispatch(saveSlip());
  });

  // Wait for slip to be saved to Redux store
  await waitFor(() => {
    const slips = store.getState().salary.slips;
    expect(slips.length).toBeGreaterThanOrEqual(1);
  }, { timeout: 1000 });
  
  const saved = store.getState().salary.slips[store.getState().salary.slips.length - 1]
  expect(saved.employee.name).toBe('Test Employee')
}, 10000)
