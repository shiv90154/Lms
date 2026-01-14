import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Book from '@/models/Book';
import mongoose from 'mongoose';

// GET /api/books/[id] - Get single book details
export async function GET(request, { params }) {
    try {
        await connectDB();

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

        if (!book.isActive) {
            return NextResponse.json(
                { error: 'Book is not available' },
                { status: 404 }
            );
        }

        // Get related books (same category, different book)
        const relatedBooks = await Book.find({
            _id: { $ne: book._id },
            category: book.category,
            isActive: true
        })
            .sort({ rating: -1, soldCount: -1 })
            .limit(4)
            .lean();

        return NextResponse.json({
            success: true,
            data: {
                book,
                relatedBooks
            }
        });

    } catch (error) {
        console.error('Error fetching book:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}