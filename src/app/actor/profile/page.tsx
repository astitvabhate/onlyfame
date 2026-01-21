'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { DashboardNav } from '@/components/DashboardNav';
import type { ActorProfile, Profile, ActorImage } from '@/types';

export default function ActorProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [actorProfile, setActorProfile] = useState<ActorProfile | null>(null);
    const [images, setImages] = useState<ActorImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form state
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [height, setHeight] = useState('');
    const [languages, setLanguages] = useState('');
    const [location, setLocation] = useState('');
    const [bio, setBio] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        // Load profile
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileData) {
            setProfile(profileData);
            setFullName(profileData.full_name || '');
            setPhone(profileData.phone || '');
        }

        // Load actor profile
        const { data: actorData } = await supabase
            .from('actor_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (actorData) {
            setActorProfile(actorData);
            setAge(actorData.age?.toString() || '');
            setGender(actorData.gender || '');
            setHeight(actorData.height || '');
            setLanguages(actorData.languages?.join(', ') || '');
            setLocation(actorData.location || '');
            setBio(actorData.bio || '');

            // Load images
            const { data: imagesData } = await supabase
                .from('actor_images')
                .select('*')
                .eq('actor_id', actorData.id);

            if (imagesData) {
                setImages(imagesData);
            }
        }

        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        const supabase = createClient();

        // Update profile
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                full_name: fullName,
                phone: phone || null,
            })
            .eq('id', profile?.id);

        if (profileError) {
            setMessage({ type: 'error', text: profileError.message });
            setSaving(false);
            return;
        }

        // Update actor profile
        const { error: actorError } = await supabase
            .from('actor_profiles')
            .update({
                age: parseInt(age) || null,
                gender: gender || null,
                height: height || null,
                languages: languages.split(',').map(l => l.trim()).filter(Boolean),
                location: location || null,
                bio: bio || null,
            })
            .eq('id', actorProfile?.id);

        if (actorError) {
            setMessage({ type: 'error', text: actorError.message });
            setSaving(false);
            return;
        }

        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setSaving(false);
    };

    const handleImageUpload = async (type: 'left' | 'center' | 'right', file: File) => {
        if (!actorProfile || !profile) return;

        const supabase = createClient();
        const fileName = `${profile.id}/${type}.${file.name.split('.').pop()}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
            .from('actor-images')
            .upload(fileName, file, { upsert: true });

        if (uploadError) {
            setMessage({ type: 'error', text: 'Failed to upload image' });
            return;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('actor-images')
            .getPublicUrl(fileName);

        // Upsert image record
        const existingImage = images.find(img => img.type === type);

        if (existingImage) {
            await supabase
                .from('actor_images')
                .update({ image_url: publicUrl })
                .eq('id', existingImage.id);
        } else {
            await supabase
                .from('actor_images')
                .insert({
                    actor_id: actorProfile.id,
                    type: type,
                    image_url: publicUrl,
                });
        }

        // Reload images
        const { data: imagesData } = await supabase
            .from('actor_images')
            .select('*')
            .eq('actor_id', actorProfile.id);

        if (imagesData) {
            setImages(imagesData);
        }

        setMessage({ type: 'success', text: `${type} image uploaded!` });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    const getImageUrl = (type: 'left' | 'center' | 'right') => {
        return images.find(img => img.type === type)?.image_url;
    };

    return (
        <div className="min-h-screen bg-neutral-950">
            <DashboardNav role="actor" userName={profile?.full_name || 'Actor'} />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-white mb-2">Your Profile</h1>
                <p className="text-neutral-400 mb-8">Complete your profile to apply for casting calls</p>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl ${message.type === 'error'
                            ? 'bg-red-500/10 border border-red-500/30 text-red-300'
                            : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* Face Images */}
                <div className="card mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Face Profile Images</h2>
                    <p className="text-neutral-400 text-sm mb-6">Upload 3 photos showing left, center, and right angles of your face</p>

                    <div className="grid grid-cols-3 gap-4">
                        {(['left', 'center', 'right'] as const).map((type) => (
                            <div key={type} className="text-center">
                                <label className="block cursor-pointer group">
                                    <div className={`aspect-square rounded-2xl border-2 border-dashed overflow-hidden ${getImageUrl(type)
                                            ? 'border-primary-500/50'
                                            : 'border-neutral-700 hover:border-neutral-600'
                                        } transition-colors`}>
                                        {getImageUrl(type) ? (
                                            <div className="relative w-full h-full">
                                                <Image
                                                    src={getImageUrl(type)!}
                                                    alt={`${type} view`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-800/50 group-hover:bg-neutral-800 transition-colors">
                                                <span className="text-3xl mb-2">📷</span>
                                                <span className="text-neutral-500 text-sm">Upload</span>
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
                                </label>
                                <p className="text-neutral-400 text-sm mt-2 capitalize">{type} View</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleSave} className="card">
                    <h2 className="text-xl font-semibold text-white mb-6">Personal Details</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="input"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="input"
                                placeholder="+91 98765 43210"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                Age *
                            </label>
                            <input
                                type="number"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                className="input"
                                min="1"
                                max="120"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                Gender *
                            </label>
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className="input"
                                required
                            >
                                <option value="">Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Non-binary">Non-binary</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                Height
                            </label>
                            <input
                                type="text"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                className="input"
                                placeholder="5'10&quot; or 178 cm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                Location
                            </label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="input"
                                placeholder="Mumbai, Maharashtra"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                Languages (comma separated)
                            </label>
                            <input
                                type="text"
                                value={languages}
                                onChange={(e) => setLanguages(e.target.value)}
                                className="input"
                                placeholder="Hindi, English, Marathi"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                                Bio
                            </label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="input min-h-[120px]"
                                placeholder="Tell casting directors about yourself, your experience, and what makes you unique..."
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn btn-primary px-8"
                        >
                            {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
