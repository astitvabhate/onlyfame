import { NextResponse } from 'next/server';
import { requireCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    const user = await requireCurrentUser();
    if (user.role !== 'caster' || !user.castingProfile) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    const castingCall = await prisma.castingCall.create({
        data: {
            casterId: user.castingProfile.id,
            title: String(body.title || ''),
            description: body.description ? String(body.description) : null,
            requirements: body.requirements || {},
            deadline: body.deadline ? new Date(body.deadline) : null,
            projectType: body.projectType ? String(body.projectType) : null,
            shootLocation: body.shootLocation ? String(body.shootLocation) : null,
            compensationDetails: body.compensationDetails ? String(body.compensationDetails) : null,
            auditionInstructions: body.auditionInstructions ? String(body.auditionInstructions) : null,
            submissionChecklist: Array.isArray(body.submissionChecklist) ? body.submissionChecklist : [],
            isActive: true,
        },
    });

    await prisma.castingProfile.update({
        where: { id: user.castingProfile.id },
        data: { onboardingStep: 2 },
    });

    return NextResponse.json({ castingCall });
}
