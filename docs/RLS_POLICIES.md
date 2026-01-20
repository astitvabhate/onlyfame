# ONLYFAME - Row Level Security Policies

## Overview

RLS policies ensure data access control at the database level. Every query is automatically filtered based on the authenticated user.

---

## Policy Matrix

| Table | Actor | Caster |
|-------|-------|--------|
| profiles | Own only | Own only |
| actor_profiles | Own CRUD | Read (via applications) |
| actor_images | Own CRUD | Read (via applications) |
| casting_profiles | Read (basics) | Own CRUD |
| casting_calls | Read all | Own CRUD |
| applications | Own submissions | Own calls only |
| notifications | Own only | Own only |

---

## Detailed Policies

### profiles

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Profile created on registration (via trigger)
CREATE POLICY "Enable insert during registration"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);
```

---

### actor_profiles

```sql
ALTER TABLE actor_profiles ENABLE ROW LEVEL SECURITY;

-- Actors can manage their own profile
CREATE POLICY "Actors can manage own profile"
ON actor_profiles FOR ALL
USING (
    user_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'actor'
    )
);

-- Casters can view actors who applied to their calls
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
```

---

### actor_images

```sql
ALTER TABLE actor_images ENABLE ROW LEVEL SECURITY;

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
```

---

### casting_profiles

```sql
ALTER TABLE casting_profiles ENABLE ROW LEVEL SECURITY;

-- Casters can manage their own profile
CREATE POLICY "Casters can manage own profile"
ON casting_profiles FOR ALL
USING (
    user_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'caster'
    )
);

-- Actors can view basic caster info (for casting calls)
CREATE POLICY "Public can view caster basics"
ON casting_profiles FOR SELECT
USING (true);
```

---

### casting_calls

```sql
ALTER TABLE casting_calls ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view casting calls
CREATE POLICY "Authenticated users can view calls"
ON casting_calls FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Casters can create calls
CREATE POLICY "Casters can create calls"
ON casting_calls FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM casting_profiles
        WHERE id = caster_id AND user_id = auth.uid()
    )
);

-- Casters can update/delete their own calls
CREATE POLICY "Casters can manage own calls"
ON casting_calls FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM casting_profiles
        WHERE id = caster_id AND user_id = auth.uid()
    )
);

CREATE POLICY "Casters can delete own calls"
ON casting_calls FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM casting_profiles
        WHERE id = caster_id AND user_id = auth.uid()
    )
);
```

---

### applications

```sql
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

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
```

---

### notifications

```sql
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());

-- Users can mark their notifications as read
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (user_id = auth.uid());

-- System inserts notifications (via service role)
CREATE POLICY "Service can insert notifications"
ON notifications FOR INSERT
WITH CHECK (true);
```

---

## Storage Policies

### actor-images bucket

```sql
-- Actors can upload their own images
CREATE POLICY "Actors can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'actor-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Actors can view their own images
CREATE POLICY "Actors can view own images"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'actor-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Casters can view applicant images
CREATE POLICY "Casters can view applicant images"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'actor-images'
    AND EXISTS (
        SELECT 1 FROM applications a
        JOIN actor_profiles ap ON a.actor_id = ap.id
        JOIN casting_calls cc ON a.casting_call_id = cc.id
        JOIN casting_profiles cp ON cc.caster_id = cp.id
        WHERE ap.user_id::text = (storage.foldername(name))[1]
        AND cp.user_id = auth.uid()
    )
);
```

### audition-videos bucket

```sql
-- Actors can upload audition videos
CREATE POLICY "Actors can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'audition-videos'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Casters can view videos for their calls
CREATE POLICY "Casters can view applicant videos"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'audition-videos'
    AND EXISTS (
        SELECT 1 FROM applications a
        JOIN casting_calls cc ON a.casting_call_id = cc.id
        JOIN casting_profiles cp ON cc.caster_id = cp.id
        WHERE a.audition_video_url LIKE '%' || name || '%'
        AND cp.user_id = auth.uid()
    )
);
```

---

## Testing Policies

Use Supabase SQL Editor with `set role`:

```sql
-- Test as specific user
SET request.jwt.claim.sub = 'user-uuid-here';

-- Run query
SELECT * FROM applications;

-- Reset
RESET request.jwt.claim.sub;
```
