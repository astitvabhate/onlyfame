import { NextResponse } from 'next/server';
import { requireCurrentUser } from '@/lib/session';

export async function GET() {
    const user = await requireCurrentUser();
    if (user.role !== 'caster') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
        profile: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
            role: user.role,
            createdAt: user.createdAt,
        },
        castingProfile: user.castingProfile,
    });
}
