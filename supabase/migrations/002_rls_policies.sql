-- ============================================
-- ONLYFAME Row Level Security Policies
-- Run this AFTER 001_schema.sql
-- ============================================

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE actor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE actor_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE casting_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE casting_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- SECURE CONTACT EXCHANGE: Only after selection
-- Actors and casters can see each other's contact info only when application status = 'selected'
CREATE POLICY "Selected parties can view contact info"
ON profiles FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM applications a
        JOIN actor_profiles ap ON a.actor_id = ap.id
        JOIN casting_calls cc ON a.casting_call_id = cc.id
        JOIN casting_profiles cp ON cc.caster_id = cp.id
        WHERE a.status = 'selected'
        AND (
            -- Caster viewing selected actor's profile
            (ap.user_id = profiles.id AND cp.user_id = auth.uid())
            OR
            -- Actor viewing caster's profile after selection
            (cp.user_id = profiles.id AND ap.user_id = auth.uid())
        )
    )
);

-- Allow insert during registration
CREATE POLICY "Enable insert for registration"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================
-- ACTOR_PROFILES POLICIES
-- ============================================

-- Actors can manage their own profile
CREATE POLICY "Actors can manage own profile"
ON actor_profiles FOR ALL
USING (user_id = auth.uid());

-- Casters can view profiles of actors who applied to their calls
CREATE POLICY "Casters can view applicant profiles"
ON actor_profiles FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM applications a
        JOIN casting_calls cc ON a.casting_call_id = cc.id
        JOIN casting_profiles cp ON cc.caster_id = cp.id
        WHERE a.actor_id = actor_profiles.id
        AND cp.user_id = auth.uid()
    )
);

-- ============================================
-- ACTOR_IMAGES POLICIES
-- ============================================

-- Actors can manage their own images
CREATE POLICY "Actors can manage own images"
ON actor_images FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM actor_profiles ap
        WHERE ap.id = actor_images.actor_id
        AND ap.user_id = auth.uid()
    )
);

-- Casters can view applicant images
CREATE POLICY "Casters can view applicant images"
ON actor_images FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM applications a
        JOIN casting_calls cc ON a.casting_call_id = cc.id
        JOIN casting_profiles cp ON cc.caster_id = cp.id
        WHERE a.actor_id = actor_images.actor_id
        AND cp.user_id = auth.uid()
    )
);

-- ============================================
-- CASTING_PROFILES POLICIES
-- ============================================

-- Casters can manage their own profile
CREATE POLICY "Casters can manage own profile"
ON casting_profiles FOR ALL
USING (user_id = auth.uid());

-- Everyone can view casting profiles (for call listings)
CREATE POLICY "Public can view casting profiles"
ON casting_profiles FOR SELECT
USING (true);

-- ============================================
-- CASTING_CALLS POLICIES
-- ============================================

-- Anyone authenticated can view active casting calls
CREATE POLICY "View active casting calls"
ON casting_calls FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);

-- Casters can view all their own calls (including inactive)
CREATE POLICY "Casters can view own calls"
ON casting_calls FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM casting_profiles
        WHERE id = caster_id AND user_id = auth.uid()
    )
);

-- Casters can create calls
CREATE POLICY "Casters can create calls"
ON casting_calls FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM casting_profiles
        WHERE id = caster_id AND user_id = auth.uid()
    )
);

-- Casters can update their own calls
CREATE POLICY "Casters can update own calls"
ON casting_calls FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM casting_profiles
        WHERE id = caster_id AND user_id = auth.uid()
    )
);

-- Casters can delete their own calls
CREATE POLICY "Casters can delete own calls"
ON casting_calls FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM casting_profiles
        WHERE id = caster_id AND user_id = auth.uid()
    )
);

-- ============================================
-- APPLICATIONS POLICIES
-- ============================================

-- Actors can view their own applications
CREATE POLICY "Actors can view own applications"
ON applications FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM actor_profiles
        WHERE id = actor_id AND user_id = auth.uid()
    )
);

-- Actors can create applications
CREATE POLICY "Actors can apply"
ON applications FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM actor_profiles
        WHERE id = actor_id AND user_id = auth.uid()
    )
);

-- Casters can view applications for their calls
CREATE POLICY "Casters can view call applications"
ON applications FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM casting_calls cc
        JOIN casting_profiles cp ON cc.caster_id = cp.id
        WHERE cc.id = casting_call_id
        AND cp.user_id = auth.uid()
    )
);

-- Casters can update application status
CREATE POLICY "Casters can update application status"
ON applications FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM casting_calls cc
        JOIN casting_profiles cp ON cc.caster_id = cp.id
        WHERE cc.id = casting_call_id
        AND cp.user_id = auth.uid()
    )
);

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (user_id = auth.uid());

-- System can insert notifications (via triggers with SECURITY DEFINER)
CREATE POLICY "System can insert notifications"
ON notifications FOR INSERT
WITH CHECK (true);
