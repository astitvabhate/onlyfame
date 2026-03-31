import { NextResponse } from 'next/server';
import { requireCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const user = await requireCurrentUser();
    if (user.role !== 'actor') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const actorProfile = await prisma.actorProfile.findUnique({
        where: { userId: user.id },
        include: { images: true },
    });

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
        actorProfile,
        images: actorProfile?.images || [],
    });
}

export async function PUT(request: Request) {
    const user = await requireCurrentUser();
    if (user.role !== 'actor') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const languages = Array.isArray(body.languages) ? body.languages : [];
    const pastWorks = Array.isArray(body.pastWorks) ? body.pastWorks : [];
    const imageTypes = Array.isArray(body.imageTypes) ? body.imageTypes : [];
    const completed = [
        Boolean(body.age && body.gender),
        Boolean(body.bio && body.location),
        Boolean(languages.length),
        ['left', 'center', 'right'].every((type) => imageTypes.includes(type)),
        Boolean(pastWorks.length),
    ].filter(Boolean).length;
    const ready = completed >= 4;

    await prisma.user.update({
        where: { id: user.id },
        data: {
            fullName: String(body.fullName || user.fullName),
            phone: body.phone ? String(body.phone) : null,
            onboardingCompleted: ready,
        },
    });

    const actorProfile = await prisma.actorProfile.update({
        where: { userId: user.id },
        data: {
            age: body.age ? Number(body.age) : null,
            gender: body.gender ? String(body.gender) : null,
            height: body.height ? String(body.height) : null,
            languages,
            location: body.location ? String(body.location) : null,
            bio: body.bio ? String(body.bio) : null,
            pastWorks,
            onboardingStep: Math.min(completed + 1, 5),
            isProfileReady: ready,
        },
    });

    return NextResponse.json({ actorProfile });
}
