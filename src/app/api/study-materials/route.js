import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import StudyMaterial from '@/models/StudyMaterial';
import { verifyAuth } from '@/middleware/auth';

// GET /api/study-materials - Get study materials with filtering and search
export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);

        // Pagination parameters
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 12;
        const skip = (page - 1) * limit;

        // Filter parameters
        const type = searchParams.get('type');
        const category = searchParams.get('category');
        const examType = searchParams.get('examType');
        const year = searchParams.get('year');
        const isPaid = searchParams.get('isPaid');
        const search = searchParams.get('search');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

        // Build query
        let query = { isActive: true };

        // Type filter
        if (type) {
            query.type = type;
        }

        // Category filter
        if (category) {
            query.category = category;
        }

        // Exam type filter
        if (examType) {
            query.examType = examType;
        }

        // Year filter
        if (year) {
            query.year = parseInt(year);
        }

        // Paid/Free filter
        if (isPaid !== null && isPaid !== undefined) {
            query.isPaid = isPaid === 'true';
        }

        // Search filter
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { tags: { $in: [searchRegex] } },
                { examType: searchRegex },
                { category: searchRegex }
            ];
        }

        // Build sort object
        let sortObj = {};
        switch (sortBy) {
            case 'downloads':
                sortObj = { downloadCount: sortOrder };
                break;
            case 'year':
                sortObj = { year: sortOrder };
                break;
            case 'title':
                sortObj = { title: sortOrder };
                break;
            case 'price':
                sortObj = { price: sortOrder };
                break;
            default:
                sortObj = { createdAt: sortOrder };
        }

        // Execute query
        const [materials, totalCount] = await Promise.all([
            StudyMaterial.find(query)
                .populate('uploadedBy', 'firstName lastName')
                .sort(sortObj)
                .skip(skip)
                .limit(limit)
                .lean(),
            StudyMaterial.countDocuments(query)
        ]);

        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return NextResponse.json({
            success: true,
            data: {
                materials,
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
        console.error('Error fetching study materials:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/study-materials - Create new study material (Admin only)
export async function POST(request) {
    try {
        const authResult = await verifyAuth(request, ['admin']);
        if (!authResult.authenticated) {
            return NextResponse.json(
                { error: authResult.error },
                { status: authResult.status }
            );
        }

        await connectDB();

        const body = await request.json();
        const {
            title,
            description,
            type,
            category,
            examType,
            year,
            fileUrl,
            thumbnailUrl,
            isPaid,
            price,
            tags,
            fileSize
        } = body;

        // Validate required fields
        if (!title || !description || !type || !category || !examType || !fileUrl) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate type
        if (!['pdf', 'notes', 'previous_paper'].includes(type)) {
            return NextResponse.json(
                { error: 'Invalid material type' },
                { status: 400 }
            );
        }

        // Create study material
        const studyMaterial = await StudyMaterial.create({
            title,
            description,
            type,
            category,
            examType,
            year: year ? parseInt(year) : undefined,
            fileUrl,
            thumbnailUrl,
            isPaid: isPaid || false,
            price: price || 0,
            tags: tags || [],
            fileSize: fileSize || 0,
            uploadedBy: authResult.user.userId
        });

        return NextResponse.json({
            success: true,
            data: studyMaterial
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating study material:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
