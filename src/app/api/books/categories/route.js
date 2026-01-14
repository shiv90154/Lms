import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Book from '@/models/Book';

// GET /api/books/categories - Get all categories and subcategories
export async function GET(request) {
    try {
        await connectDB();

        // Get distinct categories and subcategories
        const categories = await Book.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$category',
                    subcategories: { $addToSet: '$subcategory' },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    category: '$_id',
                    subcategories: {
                        $filter: {
                            input: '$subcategories',
                            cond: { $ne: ['$$this', null] }
                        }
                    },
                    count: 1
                }
            },
            { $sort: { category: 1 } }
        ]);

        // Get new arrivals count
        const newArrivalsCount = await Book.countDocuments({
            isActive: true,
            isNewArrival: true
        });

        return NextResponse.json({
            success: true,
            data: {
                categories,
                newArrivalsCount
            }
        });

    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}