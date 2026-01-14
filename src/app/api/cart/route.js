import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Cart from '@/models/Cart';
import Book from '@/models/Book';
import { verifyToken } from '@/lib/auth';

// GET /api/cart - Get user's cart
export async function GET(request) {
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
            // Return empty cart if none exists
            return NextResponse.json({
                success: true,
                data: {
                    items: [],
                    totalAmount: 0,
                    totalSavings: 0,
                    itemCount: 0
                }
            });
        }

        return NextResponse.json({
            success: true,
            data: cart
        });

    } catch (error) {
        console.error('Error fetching cart:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/cart - Add item to cart
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
        const { bookId, quantity = 1 } = await request.json();

        if (!bookId) {
            return NextResponse.json(
                { error: 'Book ID is required' },
                { status: 400 }
            );
        }

        if (quantity < 1) {
            return NextResponse.json(
                { error: 'Quantity must be at least 1' },
                { status: 400 }
            );
        }

        // Check if book exists and is available
        const book = await Book.findById(bookId);
        if (!book || !book.isActive) {
            return NextResponse.json(
                { error: 'Book not found or not available' },
                { status: 404 }
            );
        }

        // Check stock availability
        if (!book.checkStock(quantity)) {
            return NextResponse.json(
                { error: 'Insufficient stock' },
                { status: 400 }
            );
        }

        // Get or create cart
        const cart = await Cart.getOrCreateCart(userId);

        // Add item to cart
        await cart.addItem(
            bookId,
            quantity,
            book.price,
            book.discountPrice
        );

        // Populate the cart with book details
        await cart.populate('items.book');

        return NextResponse.json({
            success: true,
            data: cart,
            message: 'Item added to cart successfully'
        });

    } catch (error) {
        console.error('Error adding item to cart:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT /api/cart - Update cart item quantity
export async function PUT(request) {
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
        const { bookId, quantity } = await request.json();

        if (!bookId) {
            return NextResponse.json(
                { error: 'Book ID is required' },
                { status: 400 }
            );
        }

        if (quantity < 0) {
            return NextResponse.json(
                { error: 'Quantity cannot be negative' },
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

        // If quantity is 0, remove the item
        if (quantity === 0) {
            await cart.removeItem(bookId);
        } else {
            // Check stock availability for the new quantity
            const book = await Book.findById(bookId);
            if (!book || !book.checkStock(quantity)) {
                return NextResponse.json(
                    { error: 'Insufficient stock' },
                    { status: 400 }
                );
            }

            await cart.updateItemQuantity(bookId, quantity);
        }

        // Populate the cart with book details
        await cart.populate('items.book');

        return NextResponse.json({
            success: true,
            data: cart,
            message: 'Cart updated successfully'
        });

    } catch (error) {
        console.error('Error updating cart:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/cart - Clear entire cart
export async function DELETE(request) {
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

        await cart.clearCart();

        return NextResponse.json({
            success: true,
            data: cart,
            message: 'Cart cleared successfully'
        });

    } catch (error) {
        console.error('Error clearing cart:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}