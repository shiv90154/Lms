import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Book from '@/models/Book';

// GET /api/books - Get books with filtering and search
export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);

        // Pagination parameters
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 12;
        const skip = (page - 1) * limit;

        // Filter parameters
        const category = searchParams.get('category');
        const subcategory = searchParams.get('subcategory');
        const minPrice = parseFloat(searchParams.get('minPrice'));
        const maxPrice = parseFloat(searchParams.get('maxPrice'));
        const isNewArrival = searchParams.get('newArrivals') === 'true';
        const search = searchParams.get('search');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

        // Build query
        let query = { isActive: true };

        // Category filter
        if (category) {
            query.category = category;
        }

        // Subcategory filter
        if (subcategory) {
            query.subcategory = subcategory;
        }

        // New arrivals filter
        if (isNewArrival) {
            query.isNewArrival = true;
        }

        // Price range filter
        if (!isNaN(minPrice) || !isNaN(maxPrice)) {
            const priceQuery = [];

            if (!isNaN(minPrice) && !isNaN(maxPrice)) {
                // Both min and max price specified
                priceQuery.push(
                    { discountPrice: { $gte: minPrice, $lte: maxPrice } },
                    {
                        discountPrice: { $exists: false },
                        price: { $gte: minPrice, $lte: maxPrice }
                    }
                );
            } else if (!isNaN(minPrice)) {
                // Only min price specified
                priceQuery.push(
                    { discountPrice: { $gte: minPrice } },
                    {
                        discountPrice: { $exists: false },
                        price: { $gte: minPrice }
                    }
                );
            } else if (!isNaN(maxPrice)) {
                // Only max price specified
                priceQuery.push(
                    { discountPrice: { $lte: maxPrice } },
                    {
                        discountPrice: { $exists: false },
                        price: { $lte: maxPrice }
                    }
                );
            }

            if (priceQuery.length > 0) {
                query.$or = priceQuery;
            }
        }

        // Search filter
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$and = query.$and || [];
            query.$and.push({
                $or: [
                    { title: searchRegex },
                    { author: searchRegex },
                    { description: searchRegex },
                    { tags: { $in: [searchRegex] } }
                ]
            });
        }

        // Build sort object
        let sortObj = {};
        switch (sortBy) {
            case 'price':
                sortObj = { price: sortOrder };
                break;
            case 'rating':
                sortObj = { rating: sortOrder };
                break;
            case 'popularity':
                sortObj = { soldCount: sortOrder };
                break;
            case 'title':
                sortObj = { title: sortOrder };
                break;
            case 'author':
                sortObj = { author: sortOrder };
                break;
            default:
                sortObj = { createdAt: sortOrder };
        }

        // Execute query
        const [books, totalCount] = await Promise.all([
            Book.find(query)
                .sort(sortObj)
                .skip(skip)
                .limit(limit)
                .lean(),
            Book.countDocuments(query)
        ]);

        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return NextResponse.json({
            success: true,
            data: {
                books,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount,
                    hasNextPage,
                    hasPrevPage,
                    limit
                }
            }
        });

    } catch (error) {
        console.error('Error fetching books:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}