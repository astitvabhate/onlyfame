'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardNav } from '@/components/DashboardNav';
import { ProgressChecklist } from '@/components/ProgressChecklist';
import { getActorProfileChecklist } from '@/lib/workflows';
import type { ActorImage, ActorProfile, PastWork, Profile } from '@/types';

type EditablePastWork = PastWork & { _id: string };

const createWorkId = () =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const emptyWork = (): EditablePastWork => ({
    _id: createWorkId(),
    title: '',
    role: '',
    year: new Date().getFullYear(),
    type: 'film',
    link: '',
});

interface PastWorkRowProps {
    work: EditablePastWork;
    canRemove: boolean;
    onChange: (id: string, updates: Partial<EditablePastWork>) => void;
    onRemove: (id: string) => void;
}

function PastWorkRow({ work, canRemove, onChange, onRemove }: PastWorkRowProps) {
    return (
        <div className="rounded-[1.5rem] border border-white/8 bg-white/3 p-4">
            <div className="grid gap-4 md:grid-cols-2">
                <input
                    className="input"
                    value={work.title}
                    placeholder="Project title"
                    onChange={(e) => onChange(work._id, { title: e.target.value })}
                />
                <input
                    className="input"
                    value={work.role}
                    placeholder="Your role"
                    onChange={(e) => onChange(work._id, { role: e.target.value })}
                />
                <select
                    className="select"
                    value={work.type}
                    onChange={(e) => onChange(work._id, { type: e.target.value as PastWork['type'] })}
                >
                    <option value="film">Film</option>
                    <option value="ad">Ad</option>
                    <option value="theatre">Theatre</option>
                    <option value="web">Web</option>
                    <option value="other">Other</option>
                </select>
                <input
                    className="input"
                    type="number"
                    value={work.year}
                    onChange={(e) => onChange(work._id, { year: Number(e.target.value) })}
                />
                <div className="md:col-span-2 flex gap-3">
                    <input
                        className="input"
                        value={work.link || ''}
                        placeholder="Portfolio or reel link"
                        onChange={(e) => onChange(work._id, { link: e.target.value })}
                    />
                    {canRemove ? (
                        <button type="button" className="btn btn-ghost" onClick={() => onRemove(work._id)}>
                            Remove
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default function ActorProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [actorProfile, setActorProfile] = useState<ActorProfile | null>(null);
    const [images, setImages] = useState<ActorImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | ''; text: string }>({ type: '', text: '' });

    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [height, setHeight] = useState('');
    const [languages, setLanguages] = useState('');
    const [location, setLocation] = useState('');
    const [bio, setBio] = useState('');
    const [pastWorks, setPastWorks] = useState<EditablePastWork[]>([emptyWork()]);

    useEffect(() => {
        loadProfile();
    }, []);

    const checklist = useMemo(() => getActorProfileChecklist(actorProfile, images), [actorProfile, images]);

    const updatePastWork = (id: string, updates: Partial<EditablePastWork>) => {
        setPastWorks((prev) => prev.map((item) => (item._id === id ? { ...item, ...updates } : item)));
    };

    const removePastWork = (id: string) => {
        setPastWorks((prev) => prev.filter((item) => item._id !== id));
    };

    const loadProfile = async () => {
        const response = await fetch('/api/actor/profile');
        if (!response.ok) return;
        const payload = await response.json();
        const profileData = payload.profile;
        const actorData = payload.actorProfile;
        const imagesData = payload.images || [];

        if (profileData) {
            setProfile({
                ...profileData,
                full_name: profileData.fullName,
                avatar_url: profileData.avatarUrl,
                created_at: profileData.createdAt,
            });
            setFullName(profileData.fullName || '');
            setPhone(profileData.phone || '');
        }

        if (actorData) {
            setActorProfile({
                ...actorData,
                user_id: actorData.userId,
                past_works: actorData.pastWorks || [],
                created_at: actorData.createdAt,
                updated_at: actorData.updatedAt,
            });
            setAge(actorData.age?.toString() || '');
            setGender(actorData.gender || '');
            setHeight(actorData.height || '');
            setLanguages(actorData.languages?.join(', ') || '');
            setLocation(actorData.location || '');
            setBio(actorData.bio || '');
            setPastWorks(
                actorData.pastWorks?.length
                    ? actorData.pastWorks.map((work: PastWork) => ({ ...work, _id: createWorkId() }))
                    : [emptyWork()]
            );
            setImages(
                imagesData.map((image: any) => ({
                    ...image,
                    actor_id: image.actorId,
                    image_url: image.imageUrl,
                    created_at: image.createdAt,
                }))
            );
        }

        setLoading(false);
    };

    const persistActorProfile = async (nextPastWorks: EditablePastWork[]) => {
        const response = await fetch('/api/actor/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fullName,
                phone,
                age,
                gender,
                height,
                languages: languages.split(',').map((item) => item.trim()).filter(Boolean),
                location,
                bio,
                pastWorks: nextPastWorks
                    .filter((work) => work.title || work.role)
                    .map(({ _id, ...work }) => work),
                imageTypes: images.map((image) => image.type),
            }),
        });

        if (!response.ok) {
            const payload = await response.json();
            return { error: { message: payload.error || 'Save failed.' } };
        }

        return { error: null };
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        const { error } = await persistActorProfile(pastWorks);
        if (error) {
            setMessage({ type: 'error', text: error.message });
            setSaving(false);
            return;
        }

        setActorProfile((prev) =>
            prev
                ? {
                      ...prev,
                      age: parseInt(age) || null,
                      gender: gender || null,
                      height: height || null,
                      languages: languages.split(',').map((item) => item.trim()).filter(Boolean),
                      location: location || null,
                      bio: bio || null,
                      past_works: pastWorks.filter((work) => work.title || work.role).map(({ _id, ...work }) => work),
                  }
                : prev
        );
        setProfile((prev) => (prev ? { ...prev, full_name: fullName, phone } : prev));
        setMessage({ type: 'success', text: 'Profile updated and readiness recalculated.' });
        setSaving(false);
    };

    const handleImageUpload = async (type: 'left' | 'center' | 'right', file: File) => {
        if (!actorProfile || !profile) return;

        setMessage({ type: '', text: '' });
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('folder', `onlyfame/actors/${profile.id}`);

        const uploadResponse = await fetch('/api/uploads', {
            method: 'POST',
            body: uploadData,
        });
        const uploadPayload = await uploadResponse.json();
        if (!uploadResponse.ok) {
            setMessage({ type: 'error', text: uploadPayload.error || 'Image upload failed. Please try again.' });
            return;
        }

        const imageResponse = await fetch('/api/actor/images', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type,
                imageUrl: uploadPayload.url,
            }),
        });
        const imagePayload = await imageResponse.json();
        if (!imageResponse.ok) {
            setMessage({ type: 'error', text: imagePayload.error || 'Could not save the uploaded image.' });
            return;
        }

        if (imagePayload.images) {
            setImages(
                imagePayload.images.map((image: any) => ({
                    ...image,
                    actor_id: image.actorId,
                    image_url: image.imageUrl,
                    created_at: image.createdAt,
                }))
            );
            await persistActorProfile(pastWorks);
            setMessage({ type: 'success', text: `${type} headshot uploaded.` });
        }
    };

    const getImageUrl = (type: 'left' | 'center' | 'right') => images.find((image) => image.type === type)?.image_url;

    if (loading) {
        return <div className="page-shell flex items-center justify-center text-[var(--text)]">Loading profile...</div>;
    }

    return (
        <div className="page-shell">
            <DashboardNav role="actor" userName={profile?.full_name || 'Actor'} />

            <main className="page-container py-8">
                <div className="grid gap-8 xl:grid-cols-[0.95fr_1.35fr]">
                    <div className="space-y-8">
                        <div className="card">
                            <p className="section-label">Guided setup</p>
                            <h1 className="mt-3 font-[var(--font-serif)] text-4xl">Make your profile casting-ready</h1>
                            <p className="mt-3 text-sm text-[var(--muted)]">
                                Finish the essentials first. Your readiness score updates as soon as details and headshots are in place.
                            </p>
                        </div>

                        <ProgressChecklist
                            title="Actor profile readiness"
                            percent={checklist.percent}
                            items={checklist.checks}
                            note={checklist.readyToApply ? 'You are ready to submit auditions.' : 'Complete the remaining steps to unlock a stronger first impression.'}
                        />

                        <div className="card">
                            <p className="section-label">Headshots</p>
                            <h2 className="mt-3 panel-title">Required views</h2>
                            <p className="mt-2 text-sm text-[var(--muted)]">
                                Upload clean left, center, and right images. These give casting teams a consistent review surface.
                            </p>
                            <div className="mt-6 grid grid-cols-3 gap-3">
                                {(['left', 'center', 'right'] as const).map((type) => (
                                    <label key={type} className="group cursor-pointer">
                                        <div className="aspect-[0.78] overflow-hidden rounded-[1.5rem] border border-white/8 bg-white/4">
                                            {getImageUrl(type) ? (
                                                <img src={getImageUrl(type)} alt={`${type} headshot`} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-center text-sm text-[var(--muted)]">
                                                    Upload
                                                    <br />
                                                    {type}
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleImageUpload(type, file);
                                            }}
                                        />
                                        <p className="mt-2 text-center text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                                            {type} view
                                        </p>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="card">
                        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                            <div>
                                <p className="section-label">Profile details</p>
                                <h2 className="mt-3 font-[var(--font-serif)] text-3xl">Shape how casting teams see you</h2>
                            </div>
                            {message.text ? (
                                <div
                                    className={`rounded-full px-4 py-2 text-sm ${
                                        message.type === 'error'
                                            ? 'bg-[rgba(214,106,94,0.12)] text-[#efb3ac]'
                                            : 'bg-[rgba(84,176,138,0.12)] text-[#a9e7cb]'
                                    }`}
                                >
                                    {message.text}
                                </div>
                            ) : null}
                        </div>

                        <div className="mt-8 grid gap-5 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[var(--text)]">Full name</label>
                                <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" required />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[var(--text)]">Phone</label>
                                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="+91 98765 43210" />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[var(--text)]">Age</label>
                                <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="input" min="1" max="120" required />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[var(--text)]">Gender</label>
                                <select value={gender} onChange={(e) => setGender(e.target.value)} className="select" required>
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Non-binary">Non-binary</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[var(--text)]">Height</label>
                                <input value={height} onChange={(e) => setHeight(e.target.value)} className="input" placeholder="5'8 or 173 cm" />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[var(--text)]">Base location</label>
                                <input value={location} onChange={(e) => setLocation(e.target.value)} className="input" placeholder="Mumbai, Maharashtra" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-[var(--text)]">Languages</label>
                                <input
                                    value={languages}
                                    onChange={(e) => setLanguages(e.target.value)}
                                    className="input"
                                    placeholder="Hindi, English, Marathi"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-[var(--text)]">Profile story</label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="textarea"
                                    placeholder="Describe your screen presence, training, experience, languages, and the kind of roles you pursue."
                                />
                            </div>
                        </div>

                        <div className="divider my-8" />

                        <div>
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="section-label">Portfolio</p>
                                    <h3 className="mt-2 panel-title">Past work and screen credits</h3>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setPastWorks((prev) => [...prev, emptyWork()])}
                                >
                                    Add credit
                                </button>
                            </div>

                            <div className="mt-6 space-y-4">
                                {pastWorks.map((work) => (
                                    <PastWorkRow
                                        key={work._id}
                                        work={work}
                                        canRemove={pastWorks.length > 1}
                                        onChange={updatePastWork}
                                        onRemove={removePastWork}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-between gap-4">
                            <p className="text-sm text-[var(--muted)]">
                                Contact details remain private until a casting team selects you.
                            </p>
                            <button type="submit" disabled={saving} className="btn btn-primary">
                                {saving ? 'Saving...' : 'Save and update readiness'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
