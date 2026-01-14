import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Cart from '@/models/Cart';
import { verifyToken } from '@/lib/auth';
import mongoose from 'mongoose';

// DELETE /api/cart/[bookId] - Remove specific item from cart
export async function DELETE(request, { params }) {
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

        const { bookId } = params;
        const userId = decoded.userId;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return NextResponse.json(
                { error: 'Invalid book ID' },
                { status: 400 }
            );
        }

        const cart = await Cart.findByUser(userId);
        if (!cart) {
            return NextResponse.json(
                { error: 'Cart not found' },
                { status: 404 }
            );
        }

        // Check if item exists in cart
        if (!cart.hasItem(bookId)) {
            return NextResponse.json(
                { error: 'Item not found in cart' },
                { status: 404 }
            );
        }

        await cart.removeItem(bookId);

        // Populate the cart with book details
        await cart.populate('items.book');

        return NextResponse.json({
            success: true,
            data: cart,
            message: 'Item removed from cart successfully'
        });

    } catch (error) {
        console.error('Error removing item from cart:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}