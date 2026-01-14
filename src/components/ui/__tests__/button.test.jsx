import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../button'

describe('Button Component', () => {
    test('should render button with text', () => {
        render(<Button>Click me</Button>)
        expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
    })

    test('should handle click events', async () => {
        const handleClick = jest.fn()
        const user = userEvent.setup()

        render(<Button onClick={handleClick}>Click me</Button>)
        await user.click(screen.getByRole('button'))

        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    test('should apply default variant', () => {
        render(<Button>Default</Button>)
        const button = screen.getByRole('button')

        expect(button).toHaveClass('bg-primary')
    })

    test('should apply destructive variant', () => {
        render(<Button variant="destructive">Delete</Button>)
        const button = screen.getByRole('button')

        expect(button).toHaveClass('bg-destructive')
    })

    test('should apply outline variant', () => {
        render(<Button variant="outline">Outline</Button>)
        const button = screen.getByRole('button')

        expect(button).toHaveClass('border')
    })

    test('should apply small size', () => {
        render(<Button size="sm">Small</Button>)
        const button = screen.getByRole('button')

        expect(button).toHaveClass('h-8')
    })

    test('should apply large size', () => {
        render(<Button size="lg">Large</Button>)
        const button = screen.getByRole('button')

        expect(button).toHaveClass('h-10')
    })

    test('should be disabled when disabled prop is true', () => {
        render(<Button disabled>Disabled</Button>)
        const button = screen.getByRole('button')

        expect(button).toBeDisabled()
        expect(button).toHaveClass('disabled:opacity-50')
    })

    test('should apply custom className', () => {
        render(<Button className="custom-class">Custom</Button>)
        const button = screen.getByRole('button')

        expect(button).toHaveClass('custom-class')
    })

    test('should render as child component when asChild is true', () => {
        render(
            <Button asChild>
                <a href="/test">Link Button</a>
            </Button>
        )

        const link = screen.getByRole('link')
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/test')
    })
})
