# ONLYFAME — Product Requirements

> Casting & Talent Discovery Platform bridging aspiring actors with verified casting directors.

---

## Core Value Proposition

- **No random DMs. No WhatsApp chaos.**
- Actors audition only for roles that fit them
- Casting directors review structured, comparable submissions
- Reduces fraud, noise, and bias in casting
- Builds a trusted ecosystem for entertainment industry

---

## Actor Features

| Feature | Description | Status |
|---------|-------------|--------|
| Registration | Register/login as Actor | 🔲 |
| Profile | Personal + professional details | 🔲 |
| Face Images | 3 mandatory angles (left/center/right) | 🔲 |
| Past Work | Optional portfolio (films, ads, reels) | 🔲 |
| Browse Calls | View verified casting opportunities | 🔲 |
| Apply | Upload audition video per sample script | 🔲 |
| Notifications | Status updates (shortlisted/selected) | 🔲 |
| Contact Exchange | Secure, only after selection | 🔲 |

### Actor Flow
```
Register → Complete Profile → Upload 3 Images → Browse Calls → Apply with Video → Track Status
```

---

## Casting Director Features

| Feature | Description | Status |
|---------|-------------|--------|
| Registration | Register as Caster/Company | 🔲 |
| Company Profile | Company details + verification | 🔲 |
| Create Calls | Post roles with requirements | 🔲 |
| Sample Script | Attach script for auditions | 🔲 |
| Voice Note | Optional performance instructions | 🔲 |
| Review Apps | View actor profiles + videos | 🔲 |
| Manage Status | Shortlist/Select/Reject | 🔲 |
| Notify Actors | Auto-notify on status change | 🔲 |

### Caster Flow
```
Register → Create Profile → Post Call → Review Applications → Shortlist → Select → Share Details
```

---

## Security Requirements

| Requirement | Implementation |
|-------------|----------------|
| Role separation | RLS policies per user role |
| Data isolation | Actors can't see other actors' auditions |
| Contact protection | Phone/email visible only after selection |
| Verified casters | `verified` badge system |
| Media access | Signed URLs for private buckets |

---

## Technical Requirements

| Requirement | Solution |
|-------------|----------|
| Auth | Supabase Auth (email/password) |
| Database | PostgreSQL with RLS |
| Storage | Supabase Storage (3 buckets) |
| Realtime | Supabase Realtime for notifications |
| Frontend | Next.js 14 App Router |
| Hosting | Vercel (recommended) |
