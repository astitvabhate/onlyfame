# ONLYFAME - Interview Explanation Guide

## 2-Minute Pitch

> "ONLYFAME is a casting platform connecting actors with casting directors. It's built serverless using Next.js 14 with Supabase as Backend-as-a-Service.
>
> The key architectural decision was eliminating a traditional backend server. Supabase provides authentication, PostgreSQL database, file storage, and real-time subscriptions out of the box.
>
> Security is handled through Row Level Security policies at the database level. For example, actors can only see their own applications, while casters can only access applications for roles they posted. This means even if frontend code has bugs, data is protected at the database layer.
>
> The app has two main user flows: Actors create profiles with face shots, browse casting calls, and submit video auditions. Casting directors post roles, review applications, and update statuses. Notifications are delivered in real-time using Supabase Realtime subscriptions.
>
> It's deployed on Vercel, scales automatically, and costs near-zero at low traffic."

---

## Common Interview Questions

### Q: Why Supabase over a custom backend?

**A:** Three reasons:
1. **Speed**: Auth, database, storage, realtime - all ready immediately
2. **Security**: RLS policies enforce access control at database level
3. **Cost**: Pay only for usage, no server management

For a project like this with standard CRUD operations, a custom backend adds complexity without benefits.

---

### Q: How do you handle authorization?

**A:** Row Level Security (RLS) policies in PostgreSQL. Every table has policies that filter queries based on the authenticated user's JWT.

For example, the `applications` table policy:
```sql
CREATE POLICY "Actors can view own applications"
ON applications FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM actor_profiles
        WHERE id = actor_id AND user_id = auth.uid()
    )
);
```

This means even if an attacker bypasses the frontend, the database itself rejects unauthorized queries.

---

### Q: What's the data model?

**A:** Seven tables with clear relationships:

- `profiles` - Base user (linked to Supabase Auth)
- `actor_profiles` / `casting_profiles` - Role-specific data
- `actor_images` - Face shots (3 angles)
- `casting_calls` - Role postings
- `applications` - Junction table (actor → call)
- `notifications` - System alerts

Key constraint: One application per actor per casting call (unique composite key).

---

### Q: How do files work?

**A:** Supabase Storage with three buckets:
- `actor-images` (profile photos)
- `audition-videos` (submissions)
- `voice-notes` (casting call audio)

Private buckets use signed URLs with expiration. Storage policies mirror database RLS - actors access their own files, casters access applicant files.

---

### Q: How would you scale this?

**A:** The current architecture handles ~100K users easily. For larger scale:

1. **CDN**: Put Cloudflare in front for static assets
2. **Video CDN**: Use Mux for transcoding and streaming
3. **Search**: Add Algolia for casting call discovery
4. **Caching**: Redis for hot data (active casting calls)
5. **Edge Functions**: Move compute closer to users

---

### Q: Any trade-offs?

**A:** Yes:
1. **Vendor lock-in**: Deeply tied to Supabase
2. **Complex RLS**: Policies can get verbose for complex permissions
3. **No background jobs**: Need external (Supabase Edge Functions or Vercel Cron)
4. **Cold starts**: Serverless has occasional latency spikes

For this project, the benefits outweigh these trade-offs.

---

## System Design Diagram (Whiteboard)

```
┌─────────────────┐
│     Client      │
│  (Next.js SSR)  │
└────────┬────────┘
         │
    ┌────▼────┐
    │  Vercel │ ← Edge Network
    └────┬────┘
         │
┌────────▼────────┐
│    Supabase     │
│  ┌───────────┐  │
│  │   Auth    │  │◄─── JWT tokens
│  ├───────────┤  │
│  │ PostgreSQL│  │◄─── RLS policies
│  ├───────────┤  │
│  │  Storage  │  │◄─── Signed URLs
│  ├───────────┤  │
│  │ Realtime  │  │◄─── WebSocket
│  └───────────┘  │
└─────────────────┘
```

---

## Key Metrics to Mention

- **Auth**: Session-based with JWT refresh
- **Latency**: < 100ms for database queries (RLS adds ~5ms)
- **Storage**: 100MB video limit, 5MB image limit
- **Realtime**: Handles 1000s concurrent subscriptions
