'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardNav } from '@/components/DashboardNav';
import { ProgressChecklist } from '@/components/ProgressChecklist';
import { getCastingCallChecklist } from '@/lib/workflows';
import type { CastingRequirements } from '@/types';

export default function CreateCastingCallPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<{ full_name: string } | null>(null);
    const [casterProfile, setCasterProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [projectType, setProjectType] = useState('');
    const [shootLocation, setShootLocation] = useState('');
    const [compensationDetails, setCompensationDetails] = useState('');
    const [auditionInstructions, setAuditionInstructions] = useState('');
    const [checklist, setChecklist] = useState('Center-framed audition video\nShort introduction slate\nAvailability for shoot days');
    const [ageMin, setAgeMin] = useState('');
    const [ageMax, setAgeMax] = useState('');
    const [gender, setGender] = useState<string[]>([]);
    const [languages, setLanguages] = useState('');
    const [experienceLevel, setExperienceLevel] = useState<CastingRequirements['experience_level']>('any');
    const [deadline, setDeadline] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const previewCall = useMemo(
        () => ({
            title,
            description,
            requirements: {
                age_range: ageMin && ageMax ? { min: parseInt(ageMin), max: parseInt(ageMax) } : undefined,
                gender,
                languages: languages ? languages.split(',').map((item) => item.trim()).filter(Boolean) : undefined,
                experience_level: experienceLevel,
                location: shootLocation || undefined,
            },
            deadline,
            audition_instructions: auditionInstructions,
            submission_checklist: checklist.split('\n').map((item) => item.trim()).filter(Boolean),
        }),
        [title, description, ageMin, ageMax, gender, languages, experienceLevel, shootLocation, deadline, auditionInstructions, checklist]
    );

    const readiness = getCastingCallChecklist(previewCall);

    const loadProfile = async () => {
        const response = await fetch('/api/caster/profile');
        if (!response.ok) {
            router.push('/auth/login');
            return;
        }
        const payload = await response.json();
        setProfile({ full_name: payload.profile.fullName });
        setCasterProfile(payload.castingProfile);
        setLoading(false);
    };

    const handleGenderChange = (value: string) => {
        setGender((current) => (current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value]));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!casterProfile) return;

        setSaving(true);
        setError('');

        const requirements = {
            age_range: ageMin && ageMax ? { min: parseInt(ageMin), max: parseInt(ageMax) } : null,
            gender: gender.length ? gender : null,
            languages: languages ? languages.split(',').map((item) => item.trim()).filter(Boolean) : null,
            experience_level: experienceLevel !== 'any' ? experienceLevel : null,
            location: shootLocation || null,
        };

        const response = await fetch('/api/casting-calls', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                description,
                requirements,
                deadline: deadline || null,
                projectType: projectType || null,
                shootLocation: shootLocation || null,
                compensationDetails: compensationDetails || null,
                auditionInstructions: auditionInstructions || null,
                submissionChecklist: checklist.split('\n').map((item) => item.trim()).filter(Boolean),
            }),
        });
        const payload = await response.json();
        if (!response.ok) {
            setError(payload.error || 'Could not create casting call.');
            setSaving(false);
            return;
        }

        router.push('/caster/calls');
    };

    if (loading) {
        return <div className="page-shell flex items-center justify-center text-[var(--text)]">Loading workspace...</div>;
    }

    return (
        <div className="page-shell">
            <DashboardNav role="caster" userName={profile?.full_name || 'Caster'} />

            <main className="page-container py-8">
                <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
                    <form onSubmit={handleSubmit} className="card">
                        <p className="section-label">Create a casting call</p>
                        <h1 className="mt-3 font-[var(--font-serif)] text-4xl">Publish a brief actors can trust</h1>
                        <p className="mt-3 max-w-2xl text-[var(--muted)]">
                            Better structure improves submission quality. Give actors clear context, expectations, and a realistic timeline.
                        </p>

                        {error ? (
                            <div className="mt-6 rounded-[1.5rem] border border-[rgba(214,106,94,0.3)] bg-[rgba(214,106,94,0.1)] px-4 py-3 text-sm text-[#efb3ac]">
                                {error}
                            </div>
                        ) : null}

                        <div className="mt-8 grid gap-5 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-[var(--text)]">Role title</label>
                                <input
                                    className="input"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Lead for premium beauty campaign"
                                    required
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[var(--text)]">Project type</label>
                                <input
                                    className="input"
                                    value={projectType}
                                    onChange={(e) => setProjectType(e.target.value)}
                                    placeholder="Commercial, digital film, series"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[var(--text)]">Shoot location</label>
                                <input
                                    className="input"
                                    value={shootLocation}
                                    onChange={(e) => setShootLocation(e.target.value)}
                                    placeholder="Mumbai, Goa, remote self-tape"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-[var(--text)]">Role description</label>
                                <textarea
                                    className="textarea"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the project, the character, screen presence, shoot dates, and what a strong submission looks like."
                                    required
                                />
                            </div>
                        </div>

                        <div className="divider my-8" />

                        <div className="grid gap-5 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[var(--text)]">Minimum age</label>
                                <input className="input" type="number" value={ageMin} onChange={(e) => setAgeMin(e.target.value)} />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[var(--text)]">Maximum age</label>
                                <input className="input" type="number" value={ageMax} onChange={(e) => setAgeMax(e.target.value)} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-[var(--text)]">Gender preference</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Male', 'Female', 'Non-binary', 'Any'].map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => handleGenderChange(option)}
                                            className={`rounded-full px-4 py-2 text-sm ${
                                                gender.includes(option)
                                                    ? 'bg-[rgba(224,175,86,0.15)] text-[var(--text)]'
                                                    : 'border border-white/8 bg-white/3 text-[var(--muted)]'
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[var(--text)]">Languages</label>
                                <input
                                    className="input"
                                    value={languages}
                                    onChange={(e) => setLanguages(e.target.value)}
                                    placeholder="Hindi, English, Marathi"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[var(--text)]">Experience level</label>
                                <select
                                    className="select"
                                    value={experienceLevel}
                                    onChange={(e) => setExperienceLevel(e.target.value as CastingRequirements['experience_level'])}
                                >
                                    <option value="any">Any</option>
                                    <option value="fresher">Fresher</option>
                                    <option value="experienced">Experienced</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[var(--text)]">Application deadline</label>
                                <input className="input" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[var(--text)]">Compensation or note</label>
                                <input
                                    className="input"
                                    value={compensationDetails}
                                    onChange={(e) => setCompensationDetails(e.target.value)}
                                    placeholder="Paid, discussion after shortlist, travel covered"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-[var(--text)]">Audition instructions</label>
                                <textarea
                                    className="textarea"
                                    value={auditionInstructions}
                                    onChange={(e) => setAuditionInstructions(e.target.value)}
                                    placeholder="Give self-tape framing, tone, slate, turnaround, and any performance direction."
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-[var(--text)]">Submission checklist</label>
                                <textarea
                                    className="textarea"
                                    value={checklist}
                                    onChange={(e) => setChecklist(e.target.value)}
                                    placeholder="One item per line"
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-between gap-4">
                            <p className="max-w-md text-sm text-[var(--muted)]">
                                Contact details remain protected until you move an actor into a selected state.
                            </p>
                            <button type="submit" disabled={saving} className="btn btn-primary">
                                {saving ? 'Publishing...' : 'Publish call'}
                            </button>
                        </div>
                    </form>

                    <aside className="space-y-8">
                        <ProgressChecklist
                            title="Call readiness"
                            percent={readiness.percent}
                            items={readiness.checks}
                            note="Actors respond better when your brief answers fit, timeline, and submission questions clearly."
                        />

                        <div className="card">
                            <p className="section-label">Trust and conversion</p>
                            <h2 className="mt-3 panel-title">What boosts better submissions</h2>
                            <div className="mt-5 space-y-3">
                                <div className="rounded-[1.25rem] border border-white/8 bg-white/3 px-4 py-3 text-sm text-[var(--text)]">
                                    Add a company website and profile description so actors know who is hiring.
                                </div>
                                <div className="rounded-[1.25rem] border border-white/8 bg-white/3 px-4 py-3 text-sm text-[var(--text)]">
                                    Explain the required self-tape format to avoid unusable links.
                                </div>
                                <div className="rounded-[1.25rem] border border-white/8 bg-white/3 px-4 py-3 text-sm text-[var(--text)]">
                                    Deadlines and compensation guidance help serious applicants self-select.
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
