import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import StudyMaterial from '@/models/StudyMaterial';

// GET /api/study-materials/categories - Get all unique categories, exam types, and years
export async function GET(request) {
    try {
        await connectDB();

        // Get unique categories
        const categories = await StudyMaterial.distinct('category', { isActive: true });

        // Get unique exam types
        const examTypes = await StudyMaterial.distinct('examType', { isActive: true });

        // Get unique years
        const years = await StudyMaterial.distinct('year', { isActive: true });

        // Get unique types
        const types = await StudyMaterial.distinct('type', { isActive: true });

        return NextResponse.json({
            success: true,
            data: {
                categories: categories.sort(),
                examTypes: examTypes.sort(),
                years: years.filter(y => y).sort((a, b) => b - a), // Filter out null/undefined and sort descending
                types: types.sort()
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
