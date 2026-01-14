import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Book from '@/models/Book';

// GET /api/books/featured - Get featured books (new arrivals, bestsellers, etc.)
export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'all';
        const limit = parseInt(searchParams.get('limit')) || 8;

        let result = {};

        switch (type) {
            case 'new-arrivals':
                result.newArrivals = await Book.find({
                    isActive: true,
                    isNewArrival: true
                })
                    .sort({ createdAt: -1 })
                    .limit(limit)
                    .lean();
                break;

            case 'bestsellers':
                result.bestsellers = await Book.find({
                    isActive: true,
                    soldCount: { $gt: 0 }
                })
                    .sort({ soldCount: -1 })
                    .limit(limit)
                    .lean();
                break;

            case 'top-rated':
                result.topRated = await Book.find({
                    isActive: true,
                    rating: { $gte: 4 },
                    reviewCount: { $gt: 0 }
                })
                    .sort({ rating: -1, reviewCount: -1 })
                    .limit(limit)
                    .lean();
                break;

            case 'discounted':
                result.discounted = await Book.find({
                    isActive: true,
                    discountPrice: { $exists: true, $ne: null }
                })
                    .sort({
                        $expr: {
                            $divide: [
                                { $subtract: ['$price', '$discountPrice'] },
                                '$price'
                            ]
                        }
                    })
                    .limit(limit)
                    .lean();
                break;

            default:
                // Get all featured categories
                const [newArrivals, bestsellers, topRated, discounted] = await Promise.all([
                    Book.find({
                        isActive: true,
                        isNewArrival: true
                    })
                        .sort({ createdAt: -1 })
                        .limit(limit)
                        .lean(),

                    Book.find({
                        isActive: true,
                        soldCount: { $gt: 0 }
                    })
                        .sort({ soldCount: -1 })
                        .limit(limit)
                        .lean(),

                    Book.find({
                        isActive: true,
                        rating: { $gte: 4 },
                        reviewCount: { $gt: 0 }
                    })
                        .sort({ rating: -1, reviewCount: -1 })
                        .limit(limit)
                        .lean(),

                    Book.find({
                        isActive: true,
                        discountPrice: { $exists: true, $ne: null }
                    })
                        .sort({
                            $expr: {
                                $divide: [
                                    { $subtract: ['$price', '$discountPrice'] },
                                    '$price'
                                ]
                            }
                        })
                        .limit(limit)
                        .lean()
                ]);

                result = {
                    newArrivals,
                    bestsellers,
                    topRated,
                    discounted
                };
        }

        return NextResponse.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error fetching featured books:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}