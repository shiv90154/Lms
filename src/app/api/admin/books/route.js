import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Book from '@/models/Book';
import { verifyToken } from '@/lib/auth';

// GET /api/admin/books - Get all books for admin management
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
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);

        // Pagination parameters
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;

        // Filter parameters
        const search = searchParams.get('search');
        const category = searchParams.get('category');
        const isActive = searchParams.get('isActive');
        const lowStock = searchParams.get('lowStock') === 'true';
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

        // Build query
        let query = {};

        // Search filter
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { title: searchRegex },
                { author: searchRegex },
                { isbn: searchRegex },
                { category: searchRegex }
            ];
        }

        // Category filter
        if (category) {
            query.category = category;
        }

        // Active status filter
        if (isActive !== null && isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        // Low stock filter
        if (lowStock) {
            query.stock = { $lte: 10 };
        }

        // Build sort object
        let sortObj = {};
        sortObj[sortBy] = sortOrder;

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

        // Get summary statistics
        const [totalBooks, activeBooks, lowStockCount, totalValue] = await Promise.all([
            Book.countDocuments(),
            Book.countDocuments({ isActive: true }),
            Book.countDocuments({ stock: { $lte: 10 }, isActive: true }),
            Book.aggregate([
                { $match: { isActive: true } },
                { $group: { _id: null, total: { $sum: { $multiply: ['$stock', '$price'] } } } }
            ])
        ]);

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
                },
                summary: {
                    totalBooks,
                    activeBooks,
                    lowStockCount,
                    totalValue: totalValue[0]?.total || 0
                }
            }
        });

    } catch (error) {
        console.error('Error fetching books for admin:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/admin/books - Create new book
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
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const bookData = await request.json();

        // Validate required fields
        const requiredFields = ['title', 'author', 'description', 'price', 'category', 'images', 'stock'];
        for (const field of requiredFields) {
            if (!bookData[field]) {
                return NextResponse.json(
                    { error: `${field} is required` },
                    { status: 400 }
                );
            }
        }

        // Validate price
        if (bookData.price < 0) {
            return NextResponse.json(
                { error: 'Price must be non-negative' },
                { status: 400 }
            );
        }

        // Validate discount price
        if (bookData.discountPrice && bookData.discountPrice >= bookData.price) {
            return NextResponse.json(
                { error: 'Discount price must be less than original price' },
                { status: 400 }
            );
        }

        // Validate stock
        if (bookData.stock < 0) {
            return NextResponse.json(
                { error: 'Stock must be non-negative' },
                { status: 400 }
            );
        }

        // Check for duplicate ISBN if provided
        if (bookData.isbn) {
            const existingBook = await Book.findOne({ isbn: bookData.isbn });
            if (existingBook) {
                return NextResponse.json(
                    { error: 'A book with this ISBN already exists' },
                    { status: 400 }
                );
            }
        }

        const book = new Book(bookData);
        await book.save();

        return NextResponse.json({
            success: true,
            data: book,
            message: 'Book created successfully'
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating book:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}