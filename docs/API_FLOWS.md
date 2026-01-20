# ONLYFAME - Application Flows

## Actor Flows

### 1. Registration & Onboarding

```mermaid
sequenceDiagram
    participant A as Actor
    participant UI as Next.js
    participant Auth as Supabase Auth
    participant DB as Database

    A->>UI: Click "Join as Actor"
    UI->>Auth: signUp(email, password)
    Auth-->>UI: User created
    UI->>DB: Insert profile (role='actor')
    DB-->>UI: Profile created
    UI->>A: Redirect to /actor/profile
    A->>UI: Fill profile form
    UI->>DB: Insert actor_profile
    A->>UI: Upload face images
    UI->>Storage: Upload to actor-images/
    UI->>DB: Insert actor_images
    UI->>A: Redirect to /actor/dashboard
```

### 2. Browse & Apply to Casting Calls

```mermaid
sequenceDiagram
    participant A as Actor
    participant UI as Next.js
    participant DB as Database
    participant St as Storage

    A->>UI: Open /actor/casting-calls
    UI->>DB: SELECT * FROM casting_calls
    DB-->>UI: List of open calls
    UI->>A: Display calls with filters
    A->>UI: Click "Apply" on a call
    UI->>A: Show application modal
    A->>UI: Record/upload audition video
    UI->>St: Upload to audition-videos/
    St-->>UI: Video URL
    UI->>DB: INSERT application
    DB-->>UI: Application created
    DB->>DB: Trigger notification for caster
    UI->>A: Show success message
```

### 3. Track Application Status

```mermaid
sequenceDiagram
    participant A as Actor
    participant UI as Next.js
    participant DB as Database
    participant RT as Realtime

    A->>UI: Open /actor/applications
    UI->>DB: SELECT from applications
    DB-->>UI: List with statuses
    UI->>A: Display applications
    
    Note over RT,A: Status change by caster
    RT->>UI: Realtime update
    UI->>A: Update status badge
    UI->>A: Show notification toast
```

---

## Caster Flows

### 1. Registration & Setup

```mermaid
sequenceDiagram
    participant C as Caster
    participant UI as Next.js
    participant Auth as Supabase Auth
    participant DB as Database

    C->>UI: Click "Join as Caster"
    UI->>Auth: signUp(email, password)
    Auth-->>UI: User created
    UI->>DB: Insert profile (role='caster')
    UI->>C: Redirect to /caster/profile
    C->>UI: Fill company details
    UI->>DB: Insert casting_profile
    UI->>C: Redirect to /caster/dashboard
```

### 2. Create Casting Call

```mermaid
sequenceDiagram
    participant C as Caster
    participant UI as Next.js
    participant DB as Database
    participant St as Storage

    C->>UI: Open /caster/create-call
    C->>UI: Fill call details
    C->>UI: Upload sample script (optional)
    UI->>St: Upload to voice-notes/
    St-->>UI: File URL
    C->>UI: Record voice note (optional)
    UI->>St: Upload audio
    St-->>UI: Audio URL
    C->>UI: Submit form
    UI->>DB: INSERT casting_call
    DB-->>UI: Call created
    UI->>C: Redirect to /caster/calls
```

### 3. Review Applications

```mermaid
sequenceDiagram
    participant C as Caster
    participant UI as Next.js
    participant DB as Database

    C->>UI: Open /caster/applications
    UI->>DB: SELECT applications for caster's calls
    DB-->>UI: List of applications
    UI->>C: Display with actor previews
    C->>UI: Click on application
    UI->>DB: Fetch actor details + images
    DB-->>UI: Actor profile data
    UI->>C: Show actor modal
    C->>UI: Watch audition video
    C->>UI: Select action (shortlist/select/reject)
    UI->>DB: UPDATE application status
    DB->>DB: Insert notification for actor
    UI->>C: Confirm action
```

---

## Notification Flow

```mermaid
sequenceDiagram
    participant System as Database Trigger
    participant DB as notifications table
    participant RT as Supabase Realtime
    participant UI as Next.js
    participant U as User

    System->>DB: INSERT notification
    DB->>RT: Broadcast change
    RT->>UI: WebSocket event
    UI->>U: Show toast notification
    UI->>U: Update notification badge
    U->>UI: Click notification
    UI->>DB: UPDATE is_read = true
    UI->>U: Navigate to relevant page
```

---

## Authentication Middleware Flow

```mermaid
flowchart TD
    A[Request] --> B{Has Session?}
    B -->|No| C{Protected Route?}
    C -->|Yes| D[Redirect to /auth/login]
    C -->|No| E[Allow Access]
    B -->|Yes| F{Match Role?}
    F -->|Actor accessing /actor/*| G[Allow]
    F -->|Caster accessing /caster/*| G
    F -->|Actor accessing /caster/*| H[Redirect to /actor/dashboard]
    F -->|Caster accessing /actor/*| I[Redirect to /caster/dashboard]
```

---

## Error Handling

| Scenario | Action |
|----------|--------|
| Unauthorized access | Redirect to login |
| Role mismatch | Redirect to correct dashboard |
| RLS violation | Show "Access Denied" toast |
| Upload failure | Retry with exponential backoff |
| Network error | Show offline indicator |
