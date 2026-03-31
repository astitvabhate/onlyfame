import Link from 'next/link';
import { redirect } from 'next/navigation';
import { DashboardNav } from '@/components/DashboardNav';
import { StatusBadge } from '@/components/StatusBadge';
import { requireRole } from '@/lib/session';
import { prisma } from '@/lib/prisma';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ReviewApplicationPage({ params }: PageProps) {
    const { id } = await params;
    const user = await requireRole('caster');

    const application = await prisma.application.findFirst({
        where: {
            id,
            castingCall: {
                casterId: user.castingProfile?.id,
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

    if (!application) {
        redirect('/caster/applications');
    }

    return (
        <div className="page-shell">
            <DashboardNav role="caster" userName={user.fullName || 'Caster'} />

            <main className="page-container py-8">
                <Link href="/caster/applications" className="btn btn-ghost px-0">
                    Back to applications
                </Link>

                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                    <div className="card">
                        <div className="text-center mb-4">
                            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(224,175,86,0.12)] text-2xl font-semibold text-[var(--accent)]">
                                {application.actorProfile?.user.fullName?.charAt(0) || '?'}
                            </div>
                            <h2 className="text-xl font-bold text-white">{application.actorProfile?.user.fullName}</h2>
                            <div className="mt-2">
                                <StatusBadge status={application.status as any} />
                            </div>
                        </div>

                        <div className="space-y-3 text-sm">
                            {application.actorProfile?.height ? (
                                <div>
                                    <span className="text-neutral-500">Height</span>
                                    <p className="text-white">{application.actorProfile.height}</p>
                                </div>
                            ) : null}
                            {application.actorProfile?.languages?.length ? (
                                <div>
                                    <span className="text-neutral-500">Languages</span>
                                    <p className="text-white">{application.actorProfile.languages.join(', ')}</p>
                                </div>
                            ) : null}
                            {application.actorProfile?.bio ? (
                                <div>
                                    <span className="text-neutral-500">Bio</span>
                                    <p className="text-neutral-300">{application.actorProfile.bio}</p>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className="space-y-6 lg:col-span-2">
                        <div className="card">
                            <h3 className="text-lg font-semibold text-white mb-3">Actor message</h3>
                            {application.notes ? (
                                <p className="text-neutral-300 whitespace-pre-wrap">{application.notes}</p>
                            ) : (
                                <p className="text-neutral-500 italic">No message provided.</p>
                            )}
                        </div>

                        <div className="card">
                            <h3 className="text-lg font-semibold text-white mb-3">Audition link</h3>
                            {application.auditionVideoUrl ? (
                                <a
                                    href={application.auditionVideoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary"
                                >
                                    Open audition
                                </a>
                            ) : (
                                <p className="text-neutral-500 italic">No audition link provided.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
