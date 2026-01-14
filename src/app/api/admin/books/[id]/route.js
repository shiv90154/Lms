import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Book from '@/models/Book';
import { verifyToken } from '@/lib/auth';
import mongoose from 'mongoose';

// GET /api/admin/books/[id] - Get single book for admin
export async function GET(request, { params }) {
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
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const { id } = params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { error: 'Invalid book ID' },
                { status: 400 }
            );
        }

        const book = await Book.findById(id).lean();

        if (!book) {
            return NextResponse.json(
                { error: 'Book not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: book
        });

    } catch (error) {
        console.error('Error fetching book for admin:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT /api/admin/books/[id] - Update book
export async function PUT(request, { params }) {
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
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const { id } = params;
        const updateData = await request.json();

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { error: 'Invalid book ID' },
                { status: 400 }
            );
        }

        // Validate price if provided
        if (updateData.price !== undefined && updateData.price < 0) {
            return NextResponse.json(
                { error: 'Price must be non-negative' },
                { status: 400 }
            );
        }

        // Validate discount price if provided
        if (updateData.discountPrice !== undefined && updateData.price !== undefined) {
            if (updateData.discountPrice >= updateData.price) {
                return NextResponse.json(
                    { error: 'Discount price must be less than original price' },
                    { status: 400 }
                );
            }
        }

        // Validate stock if provided
        if (updateData.stock !== undefined && updateData.stock < 0) {
            return NextResponse.json(
                { error: 'Stock must be non-negative' },
                { status: 400 }
            );
        }

        // Check for duplicate ISBN if provided and different from current
        if (updateData.isbn) {
            const existingBook = await Book.findOne({
                isbn: updateData.isbn,
                _id: { $ne: id }
            });
            if (existingBook) {
                return NextResponse.json(
                    { error: 'A book with this ISBN already exists' },
                    { status: 400 }
                );
            }
        }

        const book = await Book.findByIdAndUpdate(
            id,
            { ...updateData, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!book) {
            return NextResponse.json(
                { error: 'Book not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: book,
            message: 'Book updated successfully'
        });

    } catch (error) {
        console.error('Error updating book:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/books/[id] - Delete book
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
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const { id } = params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { error: 'Invalid book ID' },
                { status: 400 }
            );
        }

        const book = await Book.findByIdAndDelete(id);

        if (!book) {
            return NextResponse.json(
                { error: 'Book not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Book deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting book:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}