import { NextResponse } from 'next/server';
import { requireCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    const user = await requireCurrentUser();
    if (user.role !== 'actor' || !user.actorProfile) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const castingCallId = String(body.castingCallId || '');
    const notes = body.notes ? String(body.notes) : null;
    const auditionVideoUrl = body.auditionVideoUrl ? String(body.auditionVideoUrl) : null;

    if (!castingCallId || !auditionVideoUrl) {
        return NextResponse.json({ error: 'Casting call and audition link are required.' }, { status: 400 });
    }

    const existing = await prisma.application.findUnique({
        where: {
            castingCallId_actorId: {
                castingCallId,
                actorId: user.actorProfile.id,
            },
        },
    });

    if (existing) {
        return NextResponse.json({ error: 'You already applied to this role.' }, { status: 409 });
    }

    const application = await prisma.application.create({
        data: {
            castingCallId,
            actorId: user.actorProfile.id,
            notes,
            auditionVideoUrl,
            status: 'applied',
        },
        include: {
            castingCall: {
                include: {
                    castingProfile: true,
                },
            },
        },
    });

    const casterUserId = application.castingCall.castingProfile.userId;
    await prisma.notification.create({
        data: {
            userId: casterUserId,
            type: 'new_application',
            title: 'New application received',
            message: `${user.fullName} submitted for "${application.castingCall.title}".`,
            link: '/caster/applications',
        },
    });

    return NextResponse.json({ application });
}
