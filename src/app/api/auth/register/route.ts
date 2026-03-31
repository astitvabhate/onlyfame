import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const fullName = String(body.fullName || '').trim();
        const email = String(body.email || '').trim().toLowerCase();
        const password = String(body.password || '');
        const role = body.role === 'caster' ? 'caster' : 'actor';

        if (!fullName || !email || password.length < 6) {
            return NextResponse.json({ error: 'Invalid registration details.' }, { status: 400 });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
        }

        const passwordHash = await hash(password, 10);

        const user = await prisma.user.create({
            data: {
                fullName,
                email,
                passwordHash,
                role,
                actorProfile:
                    role === 'actor'
                        ? {
                              create: {},
                          }
                        : undefined,
                castingProfile:
                    role === 'caster'
                        ? {
                              create: {
                                  companyName: fullName,
                              },
                          }
                        : undefined,
            },
        });

        return NextResponse.json({
            id: user.id,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Registration failed.';

        return NextResponse.json(
            {
                error: process.env.NODE_ENV === 'development' ? message : 'Registration failed.',
            },
            { status: 500 }
        );
    }
}
