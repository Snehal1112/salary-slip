import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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

  const name = screen.getByLabelText(/Employee Name/i)
  fireEvent.change(name, { target: { value: 'Test Employee' } })

  const save = screen.getByRole('button', { name: /Save Slip/i })
  fireEvent.click(save)

  // Wait for the saveSlip reducer to add the slip to the store
  await waitFor(() => expect(store.getState().salary.slips.length).toBeGreaterThanOrEqual(1))
  const saved = store.getState().salary.slips[store.getState().salary.slips.length - 1]
  expect(saved.employee.name).toBe('Test Employee')
})
