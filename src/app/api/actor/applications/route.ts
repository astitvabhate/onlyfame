import { NextResponse } from 'next/server';
import { requireCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const user = await requireCurrentUser();
    if (user.role !== 'actor' || !user.actorProfile) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const applications = await prisma.application.findMany({
        where: { actorId: user.actorProfile.id },
        include: {
            castingCall: {
                include: {
                    castingProfile: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return NextResponse.json({ applications });
}
