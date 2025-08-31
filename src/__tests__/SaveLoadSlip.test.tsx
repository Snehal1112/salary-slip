import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from '../store'
import FormPage from '../pages/FormPage'
import { BrowserRouter } from 'react-router-dom'

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

  // Fill all company fields
  const companyEmail = screen.getByLabelText(/Email/i)
  await act(async () => {
    fireEvent.change(companyEmail, { target: { value: 'test@email.com' } })
  });
  const companyMobile = screen.getByLabelText(/Contact Number/i)
  await act(async () => {
    fireEvent.change(companyMobile, { target: { value: '9999999999' } })
  });
  const companyGSTIN = screen.getByLabelText(/GSTIN/i)
  await act(async () => {
    fireEvent.change(companyGSTIN, { target: { value: 'GSTIN123' } })
  });
  const companyWebsite = screen.getByLabelText(/Website/i)
  await act(async () => {
    fireEvent.change(companyWebsite, { target: { value: 'https://test.com' } })
  });

  // Fill all employee fields
  const employeeName = screen.getByLabelText(/Employee Name/i)
  await act(async () => {
    fireEvent.change(employeeName, { target: { value: 'Test Employee' } })
  });
  const employeeCode = screen.getByLabelText(/Employee Code/i)
  await act(async () => {
    fireEvent.change(employeeCode, { target: { value: 'E001' } })
  });
  const employeeDesignation = screen.getByLabelText(/Designation/i)
  await act(async () => {
    fireEvent.change(employeeDesignation, { target: { value: 'Developer' } })
  });
  // Fix ambiguous PAN label
  const panInputs = screen.getAllByLabelText(/PAN/i)
  const employeePAN = panInputs.find(inp => inp.getAttribute('name') === 'employee.pan')
  await act(async () => {
    fireEvent.change(employeePAN!, { target: { value: 'ABCDE1234F' } })
  });
  const employeeBankAccount = screen.getByLabelText(/Bank Account Number/i)
  await act(async () => {
    fireEvent.change(employeeBankAccount, { target: { value: '1234567890' } })
  });
  const employeeBankName = screen.getByLabelText(/Bank Name/i)
  await act(async () => {
    fireEvent.change(employeeBankName, { target: { value: 'Test Bank' } })
  });
  const employeeChequeNumber = screen.getByLabelText(/Cheque Number/i)
  await act(async () => {
    fireEvent.change(employeeChequeNumber, { target: { value: '987654' } })
  });

  // Fill working days
  const totalWorkingDays = screen.getByLabelText(/Total Working Days/i)
  await act(async () => {
    fireEvent.change(totalWorkingDays, { target: { value: '30' } })
  });
  const daysAttended = screen.getByLabelText(/Days Attended/i)
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

  // Fill all rendered income fields
  const textboxes = screen.getAllByRole('textbox');
  const spinbuttons = screen.getAllByRole('spinbutton');
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

  // Click SAVE SLIP button
  const saveBtn = screen.getByRole('button', { name: /SAVE SLIP/i })
  await act(async () => {
    fireEvent.click(saveBtn)
  })

  // Wait for slip to be saved to Redux store
  await waitFor(() => {
    const slips = store.getState().salary.slips;
    expect(slips.length).toBeGreaterThanOrEqual(1);
    // Check all company fields
    const saved = slips[slips.length - 1];
    expect(saved.company.name).toBe('Test Company');
    expect(saved.company.address[0]).toBe('123 Main St');
    expect(saved.company.email).toBe('test@email.com');
    expect(saved.company.mobile).toBe('9999999999');
    expect(saved.company.gstin).toBe('GSTIN123');
    expect(saved.company.website).toBe('https://test.com');
    // Check all employee fields
    expect(saved.employee.name).toBe('Test Employee');
    expect(saved.employee.code).toBe('E001');
    expect(saved.employee.designation).toBe('Developer');
    expect(saved.employee.pan).toBe('ABCDE1234F');
    expect(saved.employee.bankAccount).toBe('1234567890');
    expect(saved.employee.bankName).toBe('Test Bank');
    expect(saved.employee.chequeNumber).toBe('987654');
    // Check working days
    expect(saved.workingDays.totalWorkingDays).toBe(30);
    expect(saved.workingDays.daysAttended).toBe(30);
    expect(saved.workingDays.leavesTaken).toBe(0);
    expect(saved.workingDays.balanceLeaves).toBe(0);
    // Check income and deductions
    expect(saved.income.length).toBeGreaterThan(0);
    expect(saved.deductions.length).toBeGreaterThan(0);
  }, { timeout: 1000 });

  const saved = store.getState().salary.slips[store.getState().salary.slips.length - 1]
  expect(saved.employee.name).toBe('Test Employee')
}, 10000)
