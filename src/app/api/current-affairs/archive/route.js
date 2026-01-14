import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CurrentAffair from '@/models/CurrentAffair';

// GET - Fetch archive data (years and months with content)
export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');

        const query = {
            isActive: true,
            publishedAt: { $exists: true }
        };

        if (type) query.type = type;

        // Get all unique year-month combinations
        const archive = await CurrentAffair.aggregate([
            { $match: query },
            {
                $group: {
                    _id: {
                        year: '$year',
                        month: '$month'
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } }
        ]);

        // Format the response
        const formattedArchive = archive.map(item => ({
            year: item._id.year,
            month: item._id.month,
            count: item.count
        }));

        // Group by year
        const groupedByYear = formattedArchive.reduce((acc, item) => {
            if (!acc[item.year]) {
                acc[item.year] = {
                    year: item.year,
                    months: [],
                    totalCount: 0
                };
            }
            acc[item.year].months.push({
                month: item.month,
                count: item.count
            });
            acc[item.year].totalCount += item.count;
            return acc;
        }, {});

        const yearlyArchive = Object.values(groupedByYear).sort((a, b) => b.year - a.year);

        return NextResponse.json({
            success: true,
            data: {
                archive: formattedArchive,
                yearlyArchive
            }
        });
    } catch (error) {
        console.error('Error fetching archive:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch archive', error: error.message },
            { status: 500 }
        );
    }
}
