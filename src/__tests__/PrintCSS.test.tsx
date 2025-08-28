import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from '../store'
import PreviewPage from '../pages/PreviewPage'
import { BrowserRouter } from 'react-router-dom'

test('preview contains print-area and salary-slip classes for print', async () => {
  render(
    <Provider store={store}>
      <BrowserRouter>
        <PreviewPage />
      </BrowserRouter>
    </Provider>,
  )

  const btn = await screen.findByRole('button', { name: /Export PDF \/ Print/i })
  expect(btn).toBeInTheDocument()

  // check for presence of print-area wrapper by querying the paper element role
  const paper = document.querySelector('.print-area')
  expect(paper).toBeTruthy()

  const slip = document.querySelector('.salary-slip')
  expect(slip).toBeTruthy()
})
