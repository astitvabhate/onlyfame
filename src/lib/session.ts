import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function getCurrentUser() {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    return prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            actorProfile: {
                include: {
                    images: true,
                },
            },
            castingProfile: true,
        },
    });
}

export async function requireCurrentUser() {
    const user = await getCurrentUser();
    if (!user) {
        redirect('/auth/login');
    }
    return user;
}

export async function requireRole(role: 'actor' | 'caster') {
    const user = await requireCurrentUser();
    if (user.role !== role) {
        redirect(role === 'actor' ? '/caster/dashboard' : '/actor/dashboard');
    }
    return user;
}
