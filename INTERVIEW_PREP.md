# Interview Preparation Guide - FarmTrack

## Technical Questions

### Authentication & Security

**1. "Walk me through the authentication flow"**
Answer: The app uses Supabase Auth with email/password. On login, `useAuth` hook calls `supabase.auth.signInWithPassword`, then `completeLogin` fetches or creates the farmer record. For registration, I modified `handleRegister` in `register/page.tsx` to directly call `supabase.auth.signUp` with `emailRedirectTo` for email confirmation, show a success alert, and redirect to login page. This was done instead of using the hook's register function to have more control over the UX.

**2. "How do you handle session persistence across refreshes?"**
Answer: We use Supabase's SSR package with `createBrowserClient`. Sessions are automatically synced between client and server. I also persist `farmer_id` in localStorage for quick access. The `checkSession` function in `useAuth` runs on mount and checks both the Supabase session and the stored farmer ID. It also handles demo mode by checking `localStorage.getItem('demo_mode')`.

**3. "How do you handle password reset and email verification?"**
Answer: Supabase handles this automatically. For registration, I configured `emailRedirectTo: "https://farm-track-taupe.vercel.app/login"` so users are redirected back to the login page after clicking the verification link in their email.

### Data Management

**4. "How does the AI generate farm insights?"**
Answer: `useAI` hook uses Google Gemini 1.5 Flash. When a farmer asks a question through the AI Consultant, recent records are formatted into a prompt with Nigerian market context. The model analyzes 7-day production trends and provides actionable advice. I include production data, feed costs, mortality records, and weekly aggregates in the context. The prompt is specifically crafted to provide advice relevant to Nigerian poultry farming conditions.

**5. "Explain how you handle data fetching and caching"**
Answer: `useFarmData` hook fetches data from Supabase using the farmer ID. It checks for demo mode and returns mock data immediately without API calls. For real users, it uses React's `useEffect` for initial load and `useCallback` for refresh. Error states are handled with try/catch blocks, and loading states prevent UI blocking.

**6. "How do you handle the demo mode without affecting real data?"**
Answer: Demo mode sets `demo_mode=true` in localStorage and uses `DEMO_FARMER` object with a hardcoded ID. The `checkSession` in `useAuth` recognizes demo mode and returns mock data. `useFarmData` checks for demo mode and returns predefined `DEMO_RECORDS`, `DEMO_BATCHES`, `DEMO_INVENTORY`, and `DEMO_STATS`. No API calls are made to Supabase when demo mode is active.

**7. "Describe the alert system and how you analyze trends"**
Answer: `analyzeTrends` in `useAI.ts` compares recent (last 3 records) vs previous records. If mortality doubles AND is greater than 2, or if production drops below 80% of average, critical alerts generate. The system also checks for missing records (>3 days) and health log keywords like "disease" or "sick". Alerts are stored in the `ai_alerts` table with severity levels.

### Offline Support & PWA

**8. "Explain how offline support works"**
Answer: Using `@ducanh2912/next-pwa`, I register a service worker that precaches static assets. In `next.config.ts`, I configured runtime caching with `CacheFirst` for images and `NetworkFirst` for dashboard routes. For demo mode, I return mock data from `useFarmData` hook. I also created an `~offline/page.tsx` as a fallback document.

**9. "Why did you choose server-side data fetching over client-only?"**
Answer: Supabase provides real-time Postgres capabilities that work well with server-side fetching. Server-side ensures data consistency across devices, enables complex aggregations for stats calculation in `getFarmStats`, and maintains a single source of truth for financial records. This is crucial for accurate reporting.

### Charts & Data Visualization

**10. "How is the weekly chart data prepared?"**
Answer: `prepareWeeklyData` in `WeeklyPoultryChart.tsx` transforms daily records into 7-day aggregates. It fills missing days with zeros, calculates totals for eggs and feed, and formats data for Recharts line chart display. This ensures the chart always shows 7 data points even if some days have no records.

## Architecture Questions

**11. "Why Next.js App Router over Pages Router?"**
Answer: App Router provides nested layouts which work well for the dashboard structure. Server components improve performance by reducing client bundle size. Built-in loading states handle async data fetching elegantly. The file-system routing simplifies feature organization - each route folder can have its own loading, error, and layout components.

**12. "How would you scale this for thousands of farmers?"**
Answer: Implement pagination for records to reduce initial load. Add Redis caching for frequently accessed stats. Partition database by region or farmer_id for performance. Use Supabase Row Level Security for multi-tenancy. Add background jobs for AI analysis to avoid blocking the request thread. Use CDN for static assets and implement proper indexing on database tables.

**13. "What's your approach to state management?"**
Answer: I use React's useState and useEffect hooks with custom hooks encapsulating business logic. `useAuth` and `useFarmData` provide centralized state management for authentication and farm data. I chose to avoid external state libraries like Redux since the app doesn't need complex global state - most state is localized to features.

**14. "How do you handle error boundaries and error states?"**
Answer: I have an `ErrorBoundary` component that catches JavaScript errors anywhere in the child component tree. For API calls, I use try/catch blocks with meaningful error messages displayed to users. Loading states prevent UI blocking during async operations. The registration flow shows errors inline in the form.
