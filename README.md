# ONLYFAME

A production-grade casting platform connecting actors with casting directors.

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Backend**: Supabase (BaaS)
- **Database**: PostgreSQL with RLS
- **Storage**: Supabase Storage
- **Auth**: Supabase Auth

## Features

### For Actors
- Create profile with face shots (3 angles)
- Browse casting calls
- Submit video auditions
- Track application status

### For Casting Directors
- Post casting calls with requirements
- Review actor profiles and auditions
- Shortlist, select, or reject applicants
- Real-time notifications

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/ARCHITECTURE.md) | System design and data flows |
| [Database](docs/DATABASE.md) | Schema, tables, and ERD |
| [RLS Policies](docs/RLS_POLICIES.md) | Security policies |
| [API Flows](docs/API_FLOWS.md) | User journey diagrams |
| [Storage](docs/STORAGE.md) | Media handling |
| [Interview Guide](docs/INTERVIEW_GUIDE.md) | How to explain this project |

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Project Structure

```
src/
├── app/           # Next.js pages
│   ├── auth/      # Login, Register
│   ├── actor/     # Actor dashboard
│   └── caster/    # Caster dashboard
├── components/    # UI components
├── lib/           # Supabase clients
├── types/         # TypeScript types
└── utils/         # Helpers
```

## License

MIT
