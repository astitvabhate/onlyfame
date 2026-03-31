import { redirect } from 'next/navigation';
import { ProfileSetupLoading } from '@/components/ProfileSetupLoading';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export default async function CasterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session?.user?.id) redirect('/auth/login');

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    });

    if (!user) {
        return <ProfileSetupLoading />;
    }

    if (user.role === 'actor') {
        redirect('/actor/dashboard');
    }

    return <>{children}</>;
}
