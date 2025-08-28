import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from '../../src/store'
import EmployeesPage from '../../src/pages/EmployeesPage'
import FormPage from '../../src/pages/FormPage'
import { BrowserRouter } from 'react-router-dom'

test('selecting Use on employee populates FormPage', async () => {
  const first = render(
    <Provider store={store}>
      <BrowserRouter>
        <EmployeesPage />
      </BrowserRouter>
    </Provider>
  )

  // add an employee
  const name = screen.getByLabelText(/Employee Name/i)
  fireEvent.change(name, { target: { value: 'Alice' } })
  const add = screen.getByRole('button', { name: /Add/i })
  fireEvent.click(add)

  // Use the employee
  const useBtn = await screen.findByRole('button', { name: /Use/i })
  fireEvent.click(useBtn)

  // Unmount the EmployeesPage before rendering FormPage so DOM queries are unambiguous
  first.unmount()
  render(
    <Provider store={store}>
      <BrowserRouter>
        <FormPage />
      </BrowserRouter>
    </Provider>
  )

  const empName = await screen.findByDisplayValue(/Alice/i)
  expect(empName).toBeTruthy()
})
