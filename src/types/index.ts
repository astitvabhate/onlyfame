export type UserRole = 'actor' | 'caster';
export type ImageType = 'left' | 'center' | 'right';
export type ApplicationStatus = 'applied' | 'shortlisted' | 'selected' | 'rejected';
export type VerificationStatus = 'unsubmitted' | 'pending' | 'verified';

export interface Profile {
    id: string;
    role: UserRole;
    full_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    onboarding_completed?: boolean | null;
    created_at: string;
}

export interface PastWork {
    title: string;
    type: 'film' | 'ad' | 'theatre' | 'web' | 'other';
    role: string;
    year: number;
    link?: string;
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
    onboarding_step?: number | null;
    is_profile_ready?: boolean | null;
    created_at: string;
    updated_at: string;
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
    verification_status?: VerificationStatus | null;
    trust_note?: string | null;
    onboarding_step?: number | null;
    created_at: string;
    updated_at: string;
}

export interface CastingRequirements {
    age_range?: { min: number; max: number };
    gender?: string[];
    languages?: string[];
    skills?: string[];
    location?: string;
    experience_level?: 'fresher' | 'experienced' | 'any';
}

export interface CastingCall {
    id: string;
    caster_id: string;
    title: string;
    description: string | null;
    requirements: CastingRequirements;
    sample_script_url: string | null;
    voice_note_url: string | null;
    project_type?: string | null;
    shoot_location?: string | null;
    compensation_details?: string | null;
    audition_instructions?: string | null;
    submission_checklist?: string[];
    is_active: boolean;
    deadline: string | null;
    created_at: string;
    updated_at: string;
    casting_profile?: CastingProfile;
}

export interface ApplicationReview {
    fit_label?: string;
    fit_score?: number;
    private_note?: string;
    reviewed_at?: string;
    last_action_by?: 'actor' | 'caster';
}

export interface Application {
    id: string;
    casting_call_id: string;
    actor_id: string;
    audition_video_url: string | null;
    notes: string | null;
    review_notes?: string | null;
    reviewed_at?: string | null;
    status: ApplicationStatus;
    created_at: string;
    updated_at: string;
    casting_call?: CastingCall;
    actor_profile?: ActorProfile & { profile?: Profile; images?: ActorImage[] };
}

export interface Notification {
    id: string;
    user_id: string;
    type:
        | 'activation_reminder'
        | 'application_submitted'
        | 'application_status'
        | 'new_application'
        | 'trust_update'
        | string;
    title: string;
    message: string;
    link: string | null;
    is_read: boolean;
    created_at: string;
}

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
    project_type?: string;
    shoot_location?: string;
    compensation_details?: string;
    audition_instructions?: string;
    submission_checklist?: string[];
}
