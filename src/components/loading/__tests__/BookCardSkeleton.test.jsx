import { render, screen } from '@testing-library/react'
import BookCardSkeleton from '../BookCardSkeleton'

describe('BookCardSkeleton Component', () => {
    test('should render skeleton card', () => {
        const { container } = render(<BookCardSkeleton />)

        // Check if card is rendered
        expect(container.querySelector('.overflow-hidden')).toBeInTheDocument()
    })

    test('should render multiple skeleton elements', () => {
        const { container } = render(<BookCardSkeleton />)

        // Count skeleton elements
        const skeletons = container.querySelectorAll('[class*="animate-pulse"]')
        expect(skeletons.length).toBeGreaterThan(0)
    })

    test('should render card with proper structure', () => {
        const { container } = render(<BookCardSkeleton />)

        // Check for card content and footer
        expect(container.querySelector('.p-4')).toBeInTheDocument()
    })

    test('should render aspect ratio skeleton for image', () => {
        const { container } = render(<BookCardSkeleton />)

        // Check for aspect ratio skeleton
        const imageSkeletons = container.querySelectorAll('[class*="aspect"]')
        expect(imageSkeletons.length).toBeGreaterThan(0)
    })
})
