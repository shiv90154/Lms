import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Cart from '@/models/Cart';
import { verifyToken } from '@/lib/auth';

// POST /api/cart/validate - Validate cart items against current book data
export async function POST(request) {
    try {
        await connectDB();

        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        const userId = decoded.userId;
        const cart = await Cart.findByUser(userId);

        if (!cart) {
            return NextResponse.json(
                { error: 'Cart not found' },
                { status: 404 }
            );
        }

        // Validate cart items
        const validationResults = await cart.validateItems();

        // Apply automatic fixes for price changes
        let hasChanges = false;
        for (const result of validationResults) {
            if (result.action === 'remove') {
                await cart.removeItem(result.bookId);
                hasChanges = true;
            } else if (result.action === 'update_quantity') {
                await cart.updateItemQuantity(result.bookId, result.availableStock);
                hasChanges = true;
            } else if (result.action === 'update_price') {
                // Update prices in cart item
                const item = cart.getItem(result.bookId);
                if (item) {
                    item.price = result.newPrice;
                    item.discountPrice = result.newDiscountPrice;
                    hasChanges = true;
                }
            }
        }

        if (hasChanges) {
            await cart.save();
            await cart.populate('items.book');
        }

        return NextResponse.json({
            success: true,
            data: {
                cart,
                validationResults,
                hasChanges
            },
            message: validationResults.length > 0
                ? 'Cart validation completed with issues'
                : 'Cart validation passed'
        });

    } catch (error) {
        console.error('Error validating cart:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}