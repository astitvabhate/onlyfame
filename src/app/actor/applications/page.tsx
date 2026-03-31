import Link from 'next/link';
import { DashboardNav } from '@/components/DashboardNav';
import { StatusBadge } from '@/components/StatusBadge';
import { getApplicationStatusCopy } from '@/lib/workflows';
import { requireRole } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export default async function ActorApplicationsPage() {
    const user = await requireRole('actor');
    const actorProfile = await prisma.actorProfile.findUnique({
        where: { userId: user.id },
    });

    const applications = actorProfile
        ? await prisma.application.findMany({
              where: { actorId: actorProfile.id },
              include: {
                  castingCall: {
                      include: {
                          castingProfile: true,
                      },
                  },
              },
              orderBy: { createdAt: 'desc' },
          })
        : [];

    const statusGroups = {
        applied: applications.filter((application) => application.status === 'applied').length,
        shortlisted: applications.filter((application) => application.status === 'shortlisted').length,
        selected: applications.filter((application) => application.status === 'selected').length,
        rejected: applications.filter((application) => application.status === 'rejected').length,
    };

    return (
        <div className="page-shell">
            <DashboardNav role="actor" userName={user.fullName || 'Actor'} />

            <main className="page-container py-8">
                <div className="card">
                    <p className="section-label">Application timeline</p>
                    <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h1 className="font-[var(--font-serif)] text-4xl">Track every audition from first submission to final response</h1>
                            <p className="mt-3 max-w-2xl text-[var(--muted)]">
                                This view keeps your roles, current decision stage, and any trust-sensitive next steps visible in one place.
                            </p>
                        </div>
                        <Link href="/actor/casting-calls" className="btn btn-secondary">
                            Find more calls
                        </Link>
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-4">
                        <div className="metric">
                            <p className="metric-label">Under review</p>
                            <p className="metric-value">{statusGroups.applied}</p>
                        </div>
                        <div className="metric">
                            <p className="metric-label">Shortlisted</p>
                            <p className="metric-value">{statusGroups.shortlisted}</p>
                        </div>
                        <div className="metric">
                            <p className="metric-label">Selected</p>
                            <p className="metric-value">{statusGroups.selected}</p>
                        </div>
                        <div className="metric">
                            <p className="metric-label">Closed out</p>
                            <p className="metric-value">{statusGroups.rejected}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 space-y-4">
                    {applications.length > 0 ? (
                        applications.map((application) => {
                            const status = getApplicationStatusCopy(application.status as any);

                            return (
                                <article key={application.id} className="card">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h2 className="text-2xl font-semibold text-[var(--text)]">
                                                    {application.castingCall?.title}
                                                </h2>
                                                <StatusBadge status={application.status as any} />
                                            </div>
                                            <p className="mt-2 text-sm text-[var(--muted)]">
                                                {application.castingCall?.castingProfile?.companyName || 'Casting team'}
                                                {application.castingCall?.castingProfile?.verified ? ' · verified' : ''}
                                            </p>
                                            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">{status.note}</p>
                                        </div>

                                        <div className="rounded-[1.5rem] border border-white/8 bg-white/3 px-5 py-4 text-sm text-[var(--muted)]">
                                            <p>Submitted {new Date(application.createdAt).toLocaleDateString()}</p>
                                            <p className="mt-2">
                                                {application.castingCall?.deadline
                                                    ? `Deadline ${new Date(application.castingCall.deadline).toLocaleDateString()}`
                                                    : 'Rolling review'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <div className="flex flex-wrap gap-2">
                                            {application.auditionVideoUrl ? (
                                                <a
                                                    href={application.auditionVideoUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-secondary"
                                                >
                                                    Open audition link
                                                </a>
                                            ) : null}
                                        </div>

                                        {application.status === 'selected' ? (
                                            <div className="rounded-full bg-[rgba(84,176,138,0.12)] px-4 py-2 text-sm text-[#a9e7cb]">
                                                Contact details can now be shared securely by the casting team.
                                            </div>
                                        ) : null}
                                    </div>
                                </article>
                            );
                        })
                    ) : (
                        <div className="card text-center">
                            <h2 className="font-[var(--font-serif)] text-3xl">No auditions submitted yet</h2>
                            <p className="mt-3 text-[var(--muted)]">
                                Start with an open casting call and your application timeline will appear here.
                            </p>
                            <Link href="/actor/casting-calls" className="btn btn-primary mt-8">
                                Browse open calls
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
