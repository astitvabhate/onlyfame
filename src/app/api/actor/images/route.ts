import { NextResponse } from 'next/server';
import { requireCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    const user = await requireCurrentUser();
    if (user.role !== 'actor') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const type = String(body.type || '');
    const imageUrl = String(body.imageUrl || '');

    if (!['left', 'center', 'right'].includes(type) || !imageUrl) {
        return NextResponse.json({ error: 'Invalid image payload' }, { status: 400 });
    }

    const actorProfile = await prisma.actorProfile.findUnique({
        where: { userId: user.id },
        include: { images: true },
    });

    if (!actorProfile) {
        return NextResponse.json({ error: 'Missing actor profile' }, { status: 404 });
    }

    await prisma.actorImage.upsert({
        where: {
            actorId_type: {
                actorId: actorProfile.id,
                type: type as 'left' | 'center' | 'right',
            },
        },
        create: {
            actorId: actorProfile.id,
            type: type as 'left' | 'center' | 'right',
            imageUrl,
        },
        update: {
            imageUrl,
        },
    });

    const images = await prisma.actorImage.findMany({
        where: { actorId: actorProfile.id },
    });

    return NextResponse.json({ images });
}
