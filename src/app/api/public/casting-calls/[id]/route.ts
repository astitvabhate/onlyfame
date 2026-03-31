import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
    const { id } = await context.params;
    const castingCall = await prisma.castingCall.findUnique({
        where: { id },
        include: {
            castingProfile: true,
        },
    });

    if (!castingCall || !castingCall.isActive) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ castingCall });
}
