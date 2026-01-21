'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DashboardNav } from '@/components/DashboardNav';

export default function CreateCastingCallPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<{ full_name: string } | null>(null);
    const [casterProfile, setCasterProfile] = useState<{ id: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [ageMin, setAgeMin] = useState('');
    const [ageMax, setAgeMax] = useState('');
    const [gender, setGender] = useState<string[]>([]);
    const [languages, setLanguages] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('any');
    const [deadline, setDeadline] = useState('');

    useEffect(() => {
        const loadProfile = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/auth/login');
                return;
            }

            const { data: profileData } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', user.id)
                .single();

            const { data: casterData } = await supabase
                .from('casting_profiles')
                .select('id')
                .eq('user_id', user.id)
                .single();

            setProfile(profileData);
            setCasterProfile(casterData);
            setLoading(false);
        };
        loadProfile();
    }, [router]);

    const handleGenderChange = (value: string) => {
        setGender(prev =>
            prev.includes(value)
                ? prev.filter(g => g !== value)
                : [...prev, value]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!casterProfile) return;

        setSaving(true);
        setError('');

        const supabase = createClient();

        const requirements = {
            age_range: ageMin && ageMax ? { min: parseInt(ageMin), max: parseInt(ageMax) } : null,
            gender: gender.length > 0 ? gender : null,
            languages: languages ? languages.split(',').map(l => l.trim()).filter(Boolean) : null,
            experience_level: experienceLevel !== 'any' ? experienceLevel : null,
        };

        const { error: insertError } = await supabase
            .from('casting_calls')
            .insert({
                caster_id: casterProfile.id,
                title,
                description,
                requirements,
                deadline: deadline || null,
                is_active: true,
            });

        if (insertError) {
            setError(insertError.message);
            setSaving(false);
            return;
        }

        router.push('/caster/calls');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950">
            <DashboardNav role="caster" userName={profile?.full_name || 'Caster'} />

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-white mb-2">Create Casting Call</h1>
                <p className="text-neutral-400 mb-8">Post a new role to discover talented actors</p>

                <form onSubmit={handleSubmit} className="card">
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300">
                            {error}
                        </div>
                    )}

                    {/* Title */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            Role Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input"
                            placeholder="e.g., Lead Actor for Fashion Brand Commercial"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            Role Description *
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="input min-h-[150px]"
                            placeholder="Describe the role, project context, what you're looking for in the actor, shooting location, dates, and any other relevant details..."
                            required
                        />
                    </div>

                    {/* Requirements Section */}
                    <div className="mb-6 p-4 rounded-xl bg-neutral-800/50 border border-neutral-700">
                        <h3 className="font-medium text-white mb-4">Requirements</h3>

                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Age Range */}
                            <div>
                                <label className="block text-sm text-neutral-400 mb-2">Age Range</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={ageMin}
                                        onChange={(e) => setAgeMin(e.target.value)}
                                        className="input py-2"
                                        placeholder="Min"
                                        min="0"
                                    />
                                    <span className="text-neutral-500">to</span>
                                    <input
                                        type="number"
                                        value={ageMax}
                                        onChange={(e) => setAgeMax(e.target.value)}
                                        className="input py-2"
                                        placeholder="Max"
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Experience Level */}
                            <div>
                                <label className="block text-sm text-neutral-400 mb-2">Experience Level</label>
                                <select
                                    value={experienceLevel}
                                    onChange={(e) => setExperienceLevel(e.target.value)}
                                    className="input py-2"
                                >
                                    <option value="any">Any</option>
                                    <option value="fresher">Fresher</option>
                                    <option value="experienced">Experienced</option>
                                </select>
                            </div>
                        </div>

                        {/* Gender */}
                        <div className="mt-4">
                            <label className="block text-sm text-neutral-400 mb-2">Gender</label>
                            <div className="flex flex-wrap gap-2">
                                {['Male', 'Female', 'Non-binary', 'Any'].map((g) => (
                                    <button
                                        key={g}
                                        type="button"
                                        onClick={() => handleGenderChange(g)}
                                        className={`px-4 py-2 rounded-xl text-sm transition-colors ${gender.includes(g)
                                                ? 'bg-primary-500/20 text-primary-300 border border-primary-500/50'
                                                : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:border-neutral-600'
                                            }`}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Languages */}
                        <div className="mt-4">
                            <label className="block text-sm text-neutral-400 mb-2">Languages (comma separated)</label>
                            <input
                                type="text"
                                value={languages}
                                onChange={(e) => setLanguages(e.target.value)}
                                className="input py-2"
                                placeholder="Hindi, English, Marathi"
                            />
                        </div>
                    </div>

                    {/* Deadline */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            Application Deadline (optional)
                        </label>
                        <input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="input"
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="btn btn-ghost"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn btn-primary px-8"
                        >
                            {saving ? 'Creating...' : 'Create Casting Call'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
