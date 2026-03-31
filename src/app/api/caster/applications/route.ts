import { NextResponse } from 'next/server';
import { requireCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const user = await requireCurrentUser();
    if (user.role !== 'caster' || !user.castingProfile) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const applications = await prisma.application.findMany({
        where: {
            castingCall: {
                casterId: user.castingProfile.id,
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            castingCall: {
                select: {
                    title: true,
                },
            },
            actorProfile: {
                include: {
                    images: true,
                    user: {
                        select: {
                            fullName: true,
                            email: true,
                            phone: true,
                        },
                    },
                },
            },
        },
    });

    return NextResponse.json({ applications });
}

export async function PATCH(request: Request) {
    const user = await requireCurrentUser();
    if (user.role !== 'caster' || !user.castingProfile) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const id = String(body.id || '');
    const status = body.status ? String(body.status) : undefined;
    const reviewNotes = typeof body.reviewNotes === 'string' ? body.reviewNotes : undefined;

    const existing = await prisma.application.findFirst({
        where: {
            id,
            castingCall: {
                casterId: user.castingProfile.id,
            },
        },
        include: {
            castingCall: true,
            actorProfile: {
                include: {
                    user: true,
                },
            },
        },
    });

    if (!existing) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const updated = await prisma.application.update({
        where: { id },
        data: {
            status: status as any,
            reviewNotes,
            reviewedAt: status && status !== existing.status ? new Date() : existing.reviewedAt,
        },
    });

    if (status && status !== existing.status) {
        await prisma.notification.create({
            data: {
                userId: existing.actorProfile.userId,
                type: 'application_status',
                title: 'Application update',
                message: `Your application for "${existing.castingCall.title}" is now ${status}.`,
                link: '/actor/applications',
            },
        });
    }

    return NextResponse.json({ application: updated });
}
