import Link from "next/link";

const actorBenefits = [
    "Guided profile setup that shows exactly what casting teams need before you apply.",
    "Clear audition timelines, trust cues, and protected contact sharing until you are selected.",
    "A focused submissions workspace instead of scattered chats, DMs, and spreadsheets.",
];

const casterBenefits = [
    "Role publishing with fit criteria, audition instructions, and structured submission checklists.",
    "Application review that keeps profile context, headshots, and audition links in one place.",
    "A hiring workflow built to reduce noise while still keeping talent access broad and fair.",
];

const trustSignals = [
    "Verified casting identities",
    "Protected actor contact details",
    "Transparent application states",
    "Deadline and readiness cues",
];

export default function Home() {
    return (
        <div className="page-shell cinematic-grid">
            <header className="border-b border-white/8">
                <div className="hero-container flex items-center justify-between py-5">
                    <div>
                        <p className="font-[var(--font-serif)] text-2xl tracking-[0.08em]">ONLYFAME</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                            Casting, rebuilt with trust
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/auth/login" className="btn btn-ghost">
                            Sign in
                        </Link>
                        <Link href="/auth/register" className="btn btn-primary">
                            Enter the platform
                        </Link>
                    </div>
                </div>
            </header>

            <main>
                <section className="relative overflow-hidden py-20 md:py-28">
                    <div className="hero-container grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                        <div>
                            <span className="eyebrow">India-first casting workflows for serious teams and working talent</span>
                            <h1 className="mt-8 max-w-4xl font-[var(--font-serif)] text-5xl leading-[1.02] text-[var(--text)] md:text-7xl">
                                Auditions should feel
                                <span className="text-[var(--accent)]"> considered, credible,</span> and worth showing up for.
                            </h1>
                            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
                                ONLYFAME replaces noisy casting threads with a premium workflow for role discovery,
                                audition submission, review, and decision tracking. Built for actors and casting teams
                                who need clarity without losing human nuance.
                            </p>

                            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                                <Link href="/auth/register?role=actor" className="btn btn-primary">
                                    Build your actor profile
                                </Link>
                                <Link href="/auth/register?role=caster" className="btn btn-secondary">
                                    Publish a casting call
                                </Link>
                            </div>

                            <div className="mt-12 grid gap-4 sm:grid-cols-3">
                                <div className="metric">
                                    <p className="metric-label">For actors</p>
                                    <p className="metric-value">Profile-first</p>
                                    <p className="metric-note">Know when you are truly ready to apply.</p>
                                </div>
                                <div className="metric">
                                    <p className="metric-label">For casters</p>
                                    <p className="metric-value">Review-ready</p>
                                    <p className="metric-note">See fit, media, and decision state in one flow.</p>
                                </div>
                                <div className="metric">
                                    <p className="metric-label">For both sides</p>
                                    <p className="metric-value">Protected</p>
                                    <p className="metric-note">Contact details stay private until the right moment.</p>
                                </div>
                            </div>
                        </div>

                        <div className="surface relative overflow-hidden p-6 md:p-8">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(224,175,86,0.12),transparent_38%)]" />
                            <div className="relative">
                                <p className="section-label">What the platform fixes</p>
                                <h2 className="mt-3 font-[var(--font-serif)] text-3xl">Less noise. Better decisions.</h2>
                                <div className="mt-8 space-y-4">
                                    <div className="surface-soft p-4">
                                        <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">Typical process</p>
                                        <p className="mt-2 text-base text-[var(--text)]">
                                            Unverified calls, scattered WhatsApp replies, incomplete actor details, and no
                                            clear status after submission.
                                        </p>
                                    </div>
                                    <div className="surface-soft p-4">
                                        <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">With ONLYFAME</p>
                                        <p className="mt-2 text-base text-[var(--text)]">
                                            Guided setup, structured calls, fit cues, protected information, and a clean
                                            review pipeline from first submission to final selection.
                                        </p>
                                    </div>
                                </div>
                                <div className="divider my-8" />
                                <div className="grid grid-cols-2 gap-3">
                                    {trustSignals.map((signal) => (
                                        <div key={signal} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-[var(--text)]">
                                            {signal}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-16">
                    <div className="hero-container grid gap-6 lg:grid-cols-2">
                        <div className="card">
                            <p className="section-label">Actor experience</p>
                            <h2 className="mt-3 font-[var(--font-serif)] text-4xl">Apply only when your story is ready.</h2>
                            <div className="mt-8 space-y-4">
                                {actorBenefits.map((benefit, index) => (
                                    <div key={benefit} className="flex gap-4 rounded-[1.5rem] border border-white/8 bg-white/3 p-5">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(224,175,86,0.12)] text-sm font-semibold text-[var(--accent)]">
                                            0{index + 1}
                                        </div>
                                        <p className="text-[var(--muted)]">{benefit}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="card">
                            <p className="section-label">Casting experience</p>
                            <h2 className="mt-3 font-[var(--font-serif)] text-4xl">Review talent with the right context.</h2>
                            <div className="mt-8 space-y-4">
                                {casterBenefits.map((benefit, index) => (
                                    <div key={benefit} className="flex gap-4 rounded-[1.5rem] border border-white/8 bg-white/3 p-5">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(108,157,202,0.14)] text-sm font-semibold text-[var(--info)]">
                                            0{index + 1}
                                        </div>
                                        <p className="text-[var(--muted)]">{benefit}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-16">
                    <div className="hero-container card overflow-hidden">
                        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                            <div>
                                <p className="section-label">Workflow</p>
                                <h2 className="mt-3 font-[var(--font-serif)] text-4xl">A clearer path from role brief to final decision.</h2>
                                <p className="mt-4 text-[var(--muted)]">
                                    The product is designed to feel editorial on the outside and operationally sharp underneath.
                                    Both sides always know what happens next.
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="surface-soft p-5">
                                    <p className="text-sm uppercase tracking-[0.16em] text-[var(--muted)]">1. Activate</p>
                                    <p className="mt-3 text-lg text-[var(--text)]">Set up your profile or company identity with guided steps.</p>
                                </div>
                                <div className="surface-soft p-5">
                                    <p className="text-sm uppercase tracking-[0.16em] text-[var(--muted)]">2. Submit</p>
                                    <p className="mt-3 text-lg text-[var(--text)]">Use clear requirements, deadlines, and audition instructions.</p>
                                </div>
                                <div className="surface-soft p-5">
                                    <p className="text-sm uppercase tracking-[0.16em] text-[var(--muted)]">3. Decide</p>
                                    <p className="mt-3 text-lg text-[var(--text)]">Review talent with trust cues, status logic, and private contact flow.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-16">
                    <div className="hero-container rounded-[2rem] border border-white/8 bg-[linear-gradient(135deg,rgba(224,175,86,0.12),rgba(255,255,255,0.03))] px-6 py-12 text-center md:px-12">
                        <p className="section-label">Start with the role you play</p>
                        <h2 className="mt-3 font-[var(--font-serif)] text-4xl">A sharper casting platform, ready for real work.</h2>
                        <p className="mx-auto mt-4 max-w-2xl text-[var(--muted)]">
                            Whether you are building a shortlist or building a career, ONLYFAME is designed to keep
                            momentum without sacrificing clarity.
                        </p>
                        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                            <Link href="/auth/register?role=actor" className="btn btn-primary">
                                Join as actor
                            </Link>
                            <Link href="/auth/register?role=caster" className="btn btn-secondary">
                                Join as casting team
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
