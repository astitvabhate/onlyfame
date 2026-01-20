-- ============================================
-- ONLYFAME Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CUSTOM TYPES
-- ============================================

CREATE TYPE user_role AS ENUM ('actor', 'caster');
CREATE TYPE image_type AS ENUM ('left', 'center', 'right');
CREATE TYPE application_status AS ENUM ('applied', 'shortlisted', 'selected', 'rejected');

-- ============================================
-- TABLES
-- ============================================

-- 1. profiles (linked to auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. actor_profiles
CREATE TABLE actor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    age INTEGER CHECK (age >= 0 AND age <= 120),
    gender TEXT,
    height TEXT,
    languages TEXT[] DEFAULT '{}',
    location TEXT,
    bio TEXT,
    past_works JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. actor_images
CREATE TABLE actor_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES actor_profiles(id) ON DELETE CASCADE,
    type image_type NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(actor_id, type)
);

-- 4. casting_profiles
CREATE TABLE casting_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    description TEXT,
    website TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. casting_calls
CREATE TABLE casting_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    caster_id UUID REFERENCES casting_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    requirements JSONB DEFAULT '{}',
    sample_script_url TEXT,
    voice_note_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. applications
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    casting_call_id UUID REFERENCES casting_calls(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES actor_profiles(id) ON DELETE CASCADE,
    audition_video_url TEXT NOT NULL,
    notes TEXT,
    status application_status DEFAULT 'applied',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(casting_call_id, actor_id)
);

-- 7. notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_actor_profiles_user_id ON actor_profiles(user_id);
CREATE INDEX idx_casting_profiles_user_id ON casting_profiles(user_id);
CREATE INDEX idx_casting_calls_caster_id ON casting_calls(caster_id);
CREATE INDEX idx_casting_calls_active ON casting_calls(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_applications_call ON applications(casting_call_id);
CREATE INDEX idx_applications_actor ON applications(actor_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE is_read = FALSE;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_actor_profiles_updated_at
    BEFORE UPDATE ON actor_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_casting_profiles_updated_at
    BEFORE UPDATE ON casting_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_casting_calls_updated_at
    BEFORE UPDATE ON casting_calls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- NOTIFICATION TRIGGERS
-- ============================================

-- Notify actor when application status changes
CREATE OR REPLACE FUNCTION notify_application_status_change()
RETURNS TRIGGER AS $$
DECLARE
    actor_user_id UUID;
    call_title TEXT;
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Get actor's user_id
        SELECT user_id INTO actor_user_id
        FROM actor_profiles WHERE id = NEW.actor_id;
        
        -- Get casting call title
        SELECT title INTO call_title
        FROM casting_calls WHERE id = NEW.casting_call_id;
        
        -- Insert notification
        INSERT INTO notifications (user_id, type, title, message, link)
        VALUES (
            actor_user_id,
            'application_status',
            'Application Update',
            'Your application for "' || call_title || '" has been ' || NEW.status,
            '/actor/applications'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_application_status_change
    AFTER UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION notify_application_status_change();

-- Notify caster when new application is submitted
CREATE OR REPLACE FUNCTION notify_new_application()
RETURNS TRIGGER AS $$
DECLARE
    caster_user_id UUID;
    actor_name TEXT;
    call_title TEXT;
BEGIN
    -- Get caster's user_id
    SELECT cp.user_id INTO caster_user_id
    FROM casting_profiles cp
    JOIN casting_calls cc ON cc.caster_id = cp.id
    WHERE cc.id = NEW.casting_call_id;
    
    -- Get actor name
    SELECT p.full_name INTO actor_name
    FROM profiles p
    JOIN actor_profiles ap ON ap.user_id = p.id
    WHERE ap.id = NEW.actor_id;
    
    -- Get call title
    SELECT title INTO call_title
    FROM casting_calls WHERE id = NEW.casting_call_id;
    
    -- Insert notification
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
        caster_user_id,
        'new_application',
        'New Application',
        actor_name || ' applied for "' || call_title || '"',
        '/caster/applications'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_application
    AFTER INSERT ON applications
    FOR EACH ROW EXECUTE FUNCTION notify_new_application();
