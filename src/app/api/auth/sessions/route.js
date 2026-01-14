import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAccessToken, parseDeviceInfo } from '@/lib/auth';

// GET /api/auth/sessions - Get user's active sessions
export async function GET(request) {
    try {
        await connectDB();

        const token = request.cookies.get('accessToken')?.value;
        if (!token) {
            return NextResponse.json(
                { error: 'Access token required' },
                { status: 401 }
            );
        }

        const decoded = verifyAccessToken(token);
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        const user = await User.findById(decoded.userId).select('refreshTokens');
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Filter out expired tokens and format session data
        const now = new Date();
        const activeSessions = user.refreshTokens
            .filter(tokenData => tokenData.expiresAt > now)
            .map(tokenData => {
                let deviceInfo;
                try {
                    deviceInfo = typeof tokenData.deviceInfo === 'string'
                        ? JSON.parse(tokenData.deviceInfo)
                        : tokenData.deviceInfo || {};
                } catch (e) {
                    deviceInfo = parseDeviceInfo(tokenData.deviceInfo);
                }

                return {
                    id: tokenData._id,
                    createdAt: tokenData.createdAt,
                    expiresAt: tokenData.expiresAt,
                    deviceInfo: {
                        browser: deviceInfo.browser || 'Unknown',
                        os: deviceInfo.os || 'Unknown',
                        device: deviceInfo.device || 'Desktop',
                        ip: deviceInfo.ip || 'Unknown'
                    },
                    isCurrent: tokenData.token === request.cookies.get('refreshToken')?.value
                };
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return NextResponse.json({
            success: true,
            sessions: activeSessions
        });

    } catch (error) {
        console.error('Sessions fetch error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/auth/sessions - Revoke specific session or all sessions
export async function DELETE(request) {
    try {
        await connectDB();

        const token = request.cookies.get('accessToken')?.value;
        if (!token) {
            return NextResponse.json(
                { error: 'Access token required' },
                { status: 401 }
            );
        }

        const decoded = verifyAccessToken(token);
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');
        const revokeAll = searchParams.get('revokeAll') === 'true';

        const user = await User.findById(decoded.userId);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        if (revokeAll) {
            // Revoke all sessions except current one
            const currentRefreshToken = request.cookies.get('refreshToken')?.value;
            user.refreshTokens = user.refreshTokens.filter(
                tokenData => tokenData.token === currentRefreshToken
            );
            await user.save();

            return NextResponse.json({
                success: true,
                message: 'All other sessions revoked successfully'
            });
        } else if (sessionId) {
            // Revoke specific session
            const sessionExists = user.refreshTokens.some(
                tokenData => tokenData._id.toString() === sessionId
            );

            if (!sessionExists) {
                return NextResponse.json(
                    { error: 'Session not found' },
                    { status: 404 }
                );
            }

            user.refreshTokens = user.refreshTokens.filter(
                tokenData => tokenData._id.toString() !== sessionId
            );
            await user.save();

            return NextResponse.json({
                success: true,
                message: 'Session revoked successfully'
            });
        } else {
            return NextResponse.json(
                { error: 'Session ID or revokeAll parameter required' },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error('Session revoke error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}