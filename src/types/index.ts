// Database types for ONLYFAME

export type UserRole = 'actor' | 'caster';
export type ImageType = 'left' | 'center' | 'right';
export type ApplicationStatus = 'applied' | 'shortlisted' | 'selected' | 'rejected';

export interface Profile {
    id: string;
    role: UserRole;
    full_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    created_at: string;
}

export interface ActorProfile {
    id: string;
    user_id: string;
    age: number | null;
    gender: string | null;
    height: string | null;
    languages: string[];
    location: string | null;
    bio: string | null;
    past_works: PastWork[];
    created_at: string;
    updated_at: string;
}

export interface PastWork {
    title: string;
    type: 'film' | 'ad' | 'theatre' | 'web' | 'other';
    role: string;
    year: number;
    link?: string;
}

export interface ActorImage {
    id: string;
    actor_id: string;
    type: ImageType;
    image_url: string;
    created_at: string;
}

export interface CastingProfile {
    id: string;
    user_id: string;
    company_name: string;
    description: string | null;
    website: string | null;
    verified: boolean;
    created_at: string;
    updated_at: string;
}

export interface CastingCall {
    id: string;
    caster_id: string;
    title: string;
    description: string | null;
    requirements: CastingRequirements;
    sample_script_url: string | null;
    voice_note_url: string | null;
    is_active: boolean;
    deadline: string | null;
    created_at: string;
    updated_at: string;
    // Joined fields
    casting_profile?: CastingProfile;
}

export interface CastingRequirements {
    age_range?: { min: number; max: number };
    gender?: string[];
    languages?: string[];
    skills?: string[];
    location?: string;
    experience_level?: 'fresher' | 'experienced' | 'any';
}

export interface Application {
    id: string;
    casting_call_id: string;
    actor_id: string;
    audition_video_url: string;
    notes: string | null;
    status: ApplicationStatus;
    created_at: string;
    updated_at: string;
    // Joined fields
    casting_call?: CastingCall;
    actor_profile?: ActorProfile & { profile?: Profile; images?: ActorImage[] };
}

export interface Notification {
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    link: string | null;
    is_read: boolean;
    created_at: string;
}

// Form types
export interface LoginFormData {
    email: string;
    password: string;
}

export interface RegisterFormData {
    email: string;
    password: string;
    full_name: string;
    role: UserRole;
}

export interface ActorProfileFormData {
    full_name: string;
    phone: string;
    age: number;
    gender: string;
    height: string;
    languages: string[];
    location: string;
    bio: string;
}

export interface CastingCallFormData {
    title: string;
    description: string;
    requirements: CastingRequirements;
    deadline: string;
}
