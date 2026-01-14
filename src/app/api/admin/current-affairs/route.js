import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CurrentAffair from '@/models/CurrentAffair';
import { verifyAuth } from '@/middleware/auth';

// GET - Fetch all current affairs (admin only)
export async function GET(request) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.isValid || authResult.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized access' },
                { status: 401 }
            );
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const type = searchParams.get('type');
        const category = searchParams.get('category');
        const month = searchParams.get('month');
        const year = searchParams.get('year');
        const search = searchParams.get('search');

        const query = {};

        if (type) query.type = type;
        if (category) query.category = category;
        if (month) query.month = parseInt(month);
        if (year) query.year = parseInt(year);

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { title: searchRegex },
                { summary: searchRegex },
                { content: searchRegex }
            ];
        }

        const skip = (page - 1) * limit;

        const [currentAffairs, total] = await Promise.all([
            CurrentAffair.find(query)
                .populate('author', 'firstName lastName email')
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit),
            CurrentAffair.countDocuments(query)
        ]);

        return NextResponse.json({
            success: true,
            data: currentAffairs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching current affairs:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch current affairs', error: error.message },
            { status: 500 }
        );
    }
}

// POST - Create new current affair (admin only)
export async function POST(request) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.isValid || authResult.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized access' },
                { status: 401 }
            );
        }

        await connectDB();

        const body = await request.json();
        const {
            title,
            content,
            summary,
            category,
            date,
            type,
            isPremium,
            tags,
            imageUrl,
            seoTitle,
            seoDescription,
            scheduledFor
        } = body;

        // Validation
        if (!title || !content || !summary || !category || !type) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create current affair
        const currentAffair = new CurrentAffair({
            title,
            content,
            summary,
            category,
            date: date || new Date(),
            type,
            isPremium: type === 'monthly' ? true : (isPremium || false),
            tags: tags || [],
            imageUrl,
            seoTitle,
            seoDescription,
            author: authResult.user.userId,
            scheduledFor: scheduledFor ? new Date(scheduledFor) : null
        });

        // If scheduled, don't publish immediately
        if (scheduledFor) {
            currentAffair.isActive = false;
        } else {
            currentAffair.publishedAt = new Date();
        }

        await currentAffair.save();

        return NextResponse.json({
            success: true,
            message: scheduledFor ? 'Current affair scheduled successfully' : 'Current affair created successfully',
            data: currentAffair
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating current affair:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create current affair', error: error.message },
            { status: 500 }
        );
    }
}
