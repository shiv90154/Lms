import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import StudyMaterial from '@/models/StudyMaterial';

// GET /api/study-materials/search - Advanced search with multiple filters
export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);

        // Pagination parameters
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 12;
        const skip = (page - 1) * limit;

        // Search parameter
        const query = searchParams.get('q') || searchParams.get('query') || '';

        // Filter parameters
        const type = searchParams.get('type');
        const category = searchParams.get('category');
        const examType = searchParams.get('examType');
        const year = searchParams.get('year');
        const isPaid = searchParams.get('isPaid');
        const minPrice = parseFloat(searchParams.get('minPrice'));
        const maxPrice = parseFloat(searchParams.get('maxPrice'));

        // Sort parameters
        const sortBy = searchParams.get('sortBy') || 'relevance';
        const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

        // Build search query
        let searchQuery = { isActive: true };

        // Text search
        if (query) {
            const searchRegex = new RegExp(query, 'i');
            searchQuery.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { tags: { $in: [searchRegex] } },
                { examType: searchRegex },
                { category: searchRegex }
            ];
        }

        // Type filter
        if (type) {
            searchQuery.type = type;
        }

        // Category filter
        if (category) {
            searchQuery.category = category;
        }

        // Exam type filter
        if (examType) {
            searchQuery.examType = examType;
        }

        // Year filter
        if (year) {
            searchQuery.year = parseInt(year);
        }

        // Paid/Free filter
        if (isPaid !== null && isPaid !== undefined) {
            searchQuery.isPaid = isPaid === 'true';
        }

        // Price range filter
        if (!isNaN(minPrice) || !isNaN(maxPrice)) {
            searchQuery.price = {};
            if (!isNaN(minPrice)) {
                searchQuery.price.$gte = minPrice;
            }
            if (!isNaN(maxPrice)) {
                searchQuery.price.$lte = maxPrice;
            }
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
            case 'newest':
                sortObj = { createdAt: -1 };
                break;
            case 'oldest':
                sortObj = { createdAt: 1 };
                break;
            case 'relevance':
            default:
                // For relevance, prioritize by download count and recency
                sortObj = { downloadCount: -1, createdAt: -1 };
        }

        // Execute query
        const [materials, totalCount] = await Promise.all([
            StudyMaterial.find(searchQuery)
                .populate('uploadedBy', 'firstName lastName')
                .sort(sortObj)
                .skip(skip)
                .limit(limit)
                .lean(),
            StudyMaterial.countDocuments(searchQuery)
        ]);

        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        // Get filter options for the current search
        const [availableTypes, availableCategories, availableExamTypes, availableYears] = await Promise.all([
            StudyMaterial.distinct('type', { ...searchQuery, type: { $exists: true } }),
            StudyMaterial.distinct('category', { ...searchQuery, category: { $exists: true } }),
            StudyMaterial.distinct('examType', { ...searchQuery, examType: { $exists: true } }),
            StudyMaterial.distinct('year', { ...searchQuery, year: { $exists: true } })
        ]);

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
                },
                filters: {
                    types: availableTypes.sort(),
                    categories: availableCategories.sort(),
                    examTypes: availableExamTypes.sort(),
                    years: availableYears.filter(y => y).sort((a, b) => b - a)
                },
                searchQuery: query
            }
        });

    } catch (error) {
        console.error('Error searching study materials:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
