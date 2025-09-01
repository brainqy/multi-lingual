
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Page from '../app/landing/page'
 
describe('Page', () => {
  it('renders a heading', () => {
    render(<Page />)
 
    const heading = screen.getByRole('heading', { level: 1 })
 
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Unlock Your Career Potential with AI')
  })

  it('renders the main call-to-action link', () => {
    render(<Page />)

    const ctaLink = screen.getByRole('link', { name: /Get Started Free/i })

    expect(ctaLink).toBeInTheDocument()
  })
})
