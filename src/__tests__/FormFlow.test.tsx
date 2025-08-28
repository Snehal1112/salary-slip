import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from '../../src/store'
import FormPage from '../../src/pages/FormPage'
import PreviewPage from '../../src/pages/PreviewPage'
import { BrowserRouter } from 'react-router-dom'

test('can render form and submit, preview shows net', async () => {
  render(
    <Provider store={store}>
      <BrowserRouter>
        <FormPage />
      </BrowserRouter>
    </Provider>,
  )

  const name = screen.getByLabelText(/Employee Name/i)
  fireEvent.change(name, { target: { value: 'Mr. Patel' } })

  const save = screen.getByRole('button', { name: /Save Slip/i })
  fireEvent.click(save)

  // render preview and expect net salary to be present
  render(
    <Provider store={store}>
      <BrowserRouter>
        <PreviewPage />
      </BrowserRouter>
    </Provider>,
  )

  const el = await screen.findByText(/Net Salary/i)
  expect(el).toBeTruthy()
})
