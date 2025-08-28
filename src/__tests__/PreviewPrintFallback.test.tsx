import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PreviewPage from '../pages/PreviewPage'
import { Provider } from 'react-redux'
import { store } from '../store'

// Simulate html2canvas / jspdf dynamic import failing so window.print() is used
jest.mock('html2canvas', () => { throw new Error('not installed') })
jest.mock('jspdf', () => { throw new Error('not installed') })

test('export falls back to window.print when libs missing', async () => {
  const printSpy = jest.spyOn(window, 'print').mockImplementation(() => { })

  render(
    <Provider store={store}>
      <PreviewPage />
    </Provider>
  )

  const btn = await screen.findByRole('button', { name: /Export PDF \/ Print/i })
  fireEvent.click(btn)

  await waitFor(() => expect(printSpy).toHaveBeenCalled())

  printSpy.mockRestore()
})
