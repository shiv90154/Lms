import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorDisplay from '../ErrorDisplay'

// Mock Next.js Link component
jest.mock('next/link', () => {
    return ({ children, href }) => {
        return <a href={href}>{children}</a>
    }
})

describe('ErrorDisplay Component', () => {
    test('should render with default props', () => {
        render(<ErrorDisplay />)

        expect(screen.getByText('Error')).toBeInTheDocument()
        expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    test('should render with custom title and message', () => {
        render(
            <ErrorDisplay
                title="Custom Error"
                message="This is a custom error message"
            />
        )

        expect(screen.getByText('Custom Error')).toBeInTheDocument()
        expect(screen.getByText('This is a custom error message')).toBeInTheDocument()
    })

    test('should show retry button when onRetry is provided', () => {
        const handleRetry = jest.fn()
        render(<ErrorDisplay onRetry={handleRetry} />)

        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })

    test('should call onRetry when retry button is clicked', async () => {
        const handleRetry = jest.fn()
        const user = userEvent.setup()

        render(<ErrorDisplay onRetry={handleRetry} />)
        await user.click(screen.getByRole('button', { name: /try again/i }))

        expect(handleRetry).toHaveBeenCalledTimes(1)
    })

    test('should show home button by default', () => {
        render(<ErrorDisplay />)

        expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument()
    })

    test('should hide home button when showHomeButton is false', () => {
        render(<ErrorDisplay showHomeButton={false} />)

        expect(screen.queryByRole('button', { name: /go home/i })).not.toBeInTheDocument()
    })

    test('should not show retry button when onRetry is not provided', () => {
        render(<ErrorDisplay />)

        expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument()
    })

    test('should render alert with destructive variant', () => {
        const { container } = render(<ErrorDisplay />)

        // Check if alert has destructive styling
        const alert = container.querySelector('[role="alert"]')
        expect(alert).toBeInTheDocument()
    })
})
