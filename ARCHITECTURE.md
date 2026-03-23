# Vibe Orbit - Master Blueprint

## 1. The User Journey
Vibe Orbit is designed for seamless, vibe-first interactions. The user experience flows globally as follows:
1. **Landing Page (`/`)**: A sleek, Glassmorphism-themed entry point introducing the platform.
2. **Authentication (`/login`)**: Users authenticate via Email Magic Link or Google OAuth, powered securely by Supabase.
3. **Onboarding & Personality Quiz (`/onboarding`, `/interests`, `/quiz`)**: A multi-step process where users input their age, select up to 5 core interests, and complete an 8-question personality assessment to map their "vibe".
4. **Dashboard (`/dashboard`)**: The central hub where users can see their active rooms, discover new connections, or manage their profile.
5. **Matching & Rooms (`/rooms/[id]`)**: Users are paired into secure, real-time chat rooms based on computed synergy and shared interests.

## 2. The Routing Rules
Control flow and access in Vibe Orbit are strictly enforced across two layers:
- **Middleware (`src/middleware.ts`)**: 
  - Validates the Supabase session on every request.
  - Safely redirects unauthenticated users away from protected routes (`/dashboard`, `/profile`, `/chat`, `/rooms`) and crucially, the entire onboarding sequence (`/age`, `/interests`, `/onboarding`, `/quiz`). 
  - Logged-in users attempting to access auth pages (`/login`, `/`) are instantly redirected to the dashboard.
- **Admin Quarantine (`src/app/admin/*`)**:
  - Protected by Server Component layout checks. Specific actions enforce that only `is_admin = true` users can access the interrogation hub.
  - Suspected users are placed `under_investigation` via Server Actions, which hides them globally from the app by filtering queries.

## 3. The Database Schema
Our backbone runs on PostgreSQL via Supabase, with Row Level Security (RLS) guaranteeing strict data isolation.
- **`public.users`**: Extends `auth.users`. Stores core data (`username`, `age`, `interests`, `quiz_answers`, `account_status`, `is_admin`).
- **`public.reports`**: Trust & Safety ledger. Logs `reporter_id`, `reported_id`, the `reason`, and the investigation `status` ('pending', 'investigating', 'resolved').
- **`public.admin_rooms`**: High-security isolated instances linking a `report_id`, `suspect_id`, and `admin_id` to handle active investigations.
- **`public.messages` / `public.admin_messages`**: Dedicated real-time text storage for standard rooms and interrogation rooms respectively.

## 4. The Core Engines
- **The Matching Algorithm (`src/lib/matching.ts`)**: 
  When a user finishes the vibe quiz, `calculateMatch` is invoked. It calculates absolute differences between quiz answers across an array, subtracting the deviation from a perfect 100% score (applying a `3.1` multiplier per deviation point). If the final score crosses `MINIMUM_MATCH_THRESHOLD` (65) and there's interest overlap, the user is paired. **Security Note**: All matching queries append `.eq('account_status', 'active')` to filter out banned or suspected users.
- **Onboarding Server Actions (`src/app/onboarding/actions.ts`)**:
  Functions that securely mutate user metadata (age, interests, quiz submission) from the server. By utilizing `@supabase/ssr` cookies and `revalidatePath`, these actions update the database and instantly flush Next.js Router caches to push users to the next sequence seamlessly.
