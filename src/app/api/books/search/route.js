import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Book from '@/models/Book';

// GET /api/books/search - Advanced search with suggestions
export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');
        const suggestions = searchParams.get('suggestions') === 'true';
        const limit = parseInt(searchParams.get('limit')) || 10;

        if (!query) {
            return NextResponse.json(
                { error: 'Search query is required' },
                { status: 400 }
            );
        }

        if (suggestions) {
            // Return search suggestions
            const searchRegex = new RegExp(query, 'i');

            const [titleSuggestions, authorSuggestions, tagSuggestions] = await Promise.all([
                // Title suggestions
                Book.find(
                    { title: searchRegex, isActive: true },
                    { title: 1, _id: 0 }
                ).limit(5).lean(),

                // Author suggestions
                Book.find(
                    { author: searchRegex, isActive: true },
                    { author: 1, _id: 0 }
                ).limit(5).lean(),

                // Tag suggestions
                Book.find(
                    { tags: { $in: [searchRegex] }, isActive: true },
                    { tags: 1, _id: 0 }
                ).limit(5).lean()
            ]);

            // Extract unique suggestions
            const titles = [...new Set(titleSuggestions.map(book => book.title))];
            const authors = [...new Set(authorSuggestions.map(book => book.author))];
            const tags = [...new Set(tagSuggestions.flatMap(book =>
                book.tags.filter(tag => tag.toLowerCase().includes(query.toLowerCase()))
            ))];

            return NextResponse.json({
                success: true,
                data: {
                    suggestions: {
                        titles: titles.slice(0, 3),
                        authors: authors.slice(0, 3),
                        tags: tags.slice(0, 3)
                    }
                }
            });
        }

        // Perform full search
        const searchRegex = new RegExp(query, 'i');

        const books = await Book.find({
            isActive: true,
            $or: [
                { title: searchRegex },
                { author: searchRegex },
                { description: searchRegex },
                { tags: { $in: [searchRegex] } },
                { category: searchRegex },
                { subcategory: searchRegex }
            ]
        })
            .sort({
                // Prioritize exact matches in title
                $expr: {
                    $cond: [
                        { $regexMatch: { input: '$title', regex: query, options: 'i' } },
                        0,
                        1
                    ]
                },
                rating: -1,
                soldCount: -1
            })
            .limit(limit)
            .lean();

        // Get search statistics
        const totalResults = await Book.countDocuments({
            isActive: true,
            $or: [
                { title: searchRegex },
                { author: searchRegex },
                { description: searchRegex },
                { tags: { $in: [searchRegex] } },
                { category: searchRegex },
                { subcategory: searchRegex }
            ]
        });

        return NextResponse.json({
            success: true,
            data: {
                books,
                totalResults,
                query,
                hasMore: totalResults > limit
            }
        });

    } catch (error) {
        console.error('Error performing search:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}