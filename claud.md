# CLAUDE.md - Project Instructions for Claude Code

## Project Overview

**CabinetViz Portal** is a full-stack customer portal for a cabinet visualization service business. The business model: tradespeople (cabinet makers, joiners, kitchen fitters) submit their projects, and we create 3D renders and 2D technical drawings for them to show their customers.

### Business Context
- **Target Users**: Cabinet makers, joiners, kitchen fitters who don't have 3D design skills
- **Value Proposition**: Help tradespeople win more jobs by providing professional 3D visualizations
- **Workflow**: Customer submits job → We design → Customer downloads deliverables

---

## Current State

### ✅ Completed (Phase 1 - Foundation)

| Component | Status | Notes |
|-----------|--------|-------|
| Project Setup | ✅ Done | Next.js 14, TypeScript, Tailwind, Prisma |
| Database Schema | ✅ Done | Users, Jobs, Files, Deliverables, Comments, StatusHistory |
| Authentication | ✅ Done | JWT-based auth with cookies |
| Landing Page | ✅ Done | `/` - Hero, features, CTAs |
| Login/Register | ✅ Done | `/auth/login`, `/auth/register` |
| Customer Dashboard | ✅ Done | `/dashboard` - Stats, recent jobs |
| Create Job Form | ✅ Done | `/jobs/new` - Multi-step form with file upload |
| Job Detail Page | ✅ Done | `/jobs/[id]` - Progress, files, deliverables, comments |
| API Routes | ✅ Done | Auth, Jobs, File Upload |

### 🚧 In Progress (Phase 2 - Core Features)

| Feature | Priority | Notes |
|---------|----------|-------|
| Jobs List Page | High | `/jobs` - Table view of all customer jobs |
| Admin Dashboard | High | Separate admin area to manage all jobs |
| File Download System | High | Proper file serving for deliverables |
| Comment System | Medium | Real comment posting (currently UI only) |

### 📋 Planned (Phase 3+)

| Feature | Priority | Notes |
|---------|----------|-------|
| Admin Job Management | High | Update status, progress, add deliverables |
| Email Notifications | High | SendGrid/Resend for status updates |
| Payment Integration | Medium | Stripe for quotes and payments |
| Real-time Updates | Medium | WebSocket or polling for status changes |
| Customer Profile/Settings | Medium | Edit profile, change password |
| Notification Center | Medium | In-app notifications |
| Remotion Integration | Low | Video walkthroughs of 3D renders |
| Mobile App | Low | React Native version |

---

## Tech Stack

```
Frontend:       Next.js 14 (App Router), React 18, TypeScript
Styling:        Tailwind CSS (custom theme with wood-inspired colors)
Database:       PostgreSQL (or SQLite for dev) via Prisma ORM
Auth:           JWT tokens (jose library), bcryptjs for passwords
File Upload:    Native FormData, stored in /public/uploads
Validation:     Zod schemas
State:          React hooks (no Redux needed yet)
```

---

## Project Structure

```
cabinetviz-portal/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Login, register endpoints
│   │   ├── jobs/          # Job CRUD
│   │   └── upload/        # File uploads
│   ├── auth/              # Auth pages (login, register)
│   ├── dashboard/         # Customer dashboard
│   │   ├── layout.tsx     # Sidebar layout
│   │   └── page.tsx       # Dashboard home
│   ├── jobs/              # Job pages
│   │   ├── new/           # Create job form
│   │   └── [id]/          # Job detail
│   ├── globals.css        # Global styles + Tailwind
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable components (to be built)
│   ├── ui/               # Base UI components
│   ├── dashboard/        # Dashboard-specific
│   └── jobs/             # Job-specific
├── lib/                   # Utilities
│   ├── auth.ts           # Auth helpers (JWT, sessions)
│   ├── db.ts             # Prisma client
│   ├── utils.ts          # General utilities
│   └── validations.ts    # Zod schemas
├── prisma/
│   └── schema.prisma     # Database schema
└── public/uploads/        # User uploaded files
```

---

## Database Models

### Key Relationships
```
User (1) ──→ (many) Job
Job (1) ──→ (many) JobFile (uploads from customer)
Job (1) ──→ (many) Deliverable (our outputs)
Job (1) ──→ (many) Comment
Job (1) ──→ (many) StatusHistory
User (1) ──→ (many) Notification
```

### Job Status Flow
```
PENDING → QUOTED → IN_PROGRESS → REVIEW → COMPLETED
                       ↓
                   REVISION (loops back to IN_PROGRESS)
```

### User Roles
- `CUSTOMER` - Default, can create jobs, view own jobs
- `ADMIN` - Can view all jobs, update status, upload deliverables
- `DESIGNER` - Can be assigned to jobs (future)

---

## Coding Conventions

### File Naming
- Components: PascalCase (`JobCard.tsx`)
- Utilities: camelCase (`formatDate.ts`)
- Pages: lowercase with hyphens (`new-job/page.tsx`)

### Component Structure
```tsx
// 1. Imports
import { ... } from 'react'
import { ... } from '@/lib/...'

// 2. Types
interface Props { ... }

// 3. Component
export default function ComponentName({ ... }: Props) {
  // Hooks first
  // Then handlers
  // Then render
}

// 4. Sub-components (if small)
function SubComponent() { ... }
```

### API Route Pattern
```tsx
export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const user = await getCurrentUser()
    if (!user) return unauthorized()
    
    // 2. Parse & validate input
    const body = await request.json()
    const validated = schema.safeParse(body)
    
    // 3. Business logic
    const result = await prisma.model.create(...)
    
    // 4. Return response
    return NextResponse.json({ data: result })
  } catch (error) {
    return handleError(error)
  }
}
```

### Styling
- Use Tailwind utilities
- Custom classes in `globals.css` under `@layer components`
- Color palette: `primary-500` (walnut brown), `accent` (gold)
- Consistent spacing: `p-6`, `gap-4`, `rounded-xl`

---

## Current Tasks & Priorities

### Immediate (Do These First)

1. **Create `/jobs` page** - List all customer jobs with filtering
   - Table view with status badges
   - Filter by status
   - Search by title/job number
   - Pagination

2. **Create Admin Layout & Dashboard**
   - `/admin` - Admin dashboard
   - `/admin/jobs` - All jobs from all customers
   - `/admin/jobs/[id]` - Admin job view with edit capabilities

3. **Admin Job Actions**
   - Update job status
   - Update progress percentage
   - Upload deliverables (3D renders, 2D drawings)
   - Add internal notes

### Secondary

4. **Implement Comment System**
   - POST `/api/jobs/[id]/comments`
   - Real-time or polling updates
   - Admin vs customer comments

5. **Email Notifications**
   - Setup Resend or SendGrid
   - Trigger on status change
   - Trigger when deliverable uploaded

6. **File Management**
   - Better file preview
   - Image gallery for renders
   - ZIP download for all deliverables

---

## Environment Setup

```bash
# Required environment variables
DATABASE_URL="postgresql://..." # or "file:./dev.db" for SQLite
JWT_SECRET="your-secret-key"

# Optional
SMTP_HOST="..."
SMTP_USER="..."
SMTP_PASS="..."
```

### Database Commands
```bash
npx prisma generate      # Generate client
npx prisma db push       # Push schema changes
npx prisma studio        # Visual DB browser
npx prisma migrate dev   # Create migration (production)
```

---

## Testing Approach

Currently no tests. When adding:
- Unit tests: Vitest for utilities
- API tests: Vitest + supertest
- E2E tests: Playwright

---

## Design System

### Colors
```
Primary (Walnut):  #5D4E37 (primary-500)
Accent (Gold):     #B8860B 
Background:        #F8F9FB (gray-50)
Cards:             #FFFFFF
Text:              #3D4254 (gray-700)
Text Light:        #6B7280 (gray-500)
```

### Components to Build
- [ ] `Button` - Primary, secondary, ghost, danger variants
- [ ] `Input` - Text, select, textarea with labels
- [ ] `Card` - Base card with hover states
- [ ] `Badge` - Status badges with colors
- [ ] `Modal` - Dialog component
- [ ] `Table` - Data table with sorting
- [ ] `FileUpload` - Dropzone component
- [ ] `Avatar` - User avatar with initials
- [ ] `ProgressBar` - Job progress indicator

---

## Important Notes for Claude

1. **Always check auth** - Every API route and page should verify user session
2. **Validate inputs** - Use Zod schemas for all API inputs
3. **Handle errors gracefully** - Try/catch in API routes, error boundaries in UI
4. **Keep it simple** - No over-engineering, add complexity only when needed
5. **Mobile responsive** - All pages should work on mobile
6. **Consistent styling** - Follow the existing Tailwind patterns

### When Adding New Features
1. Add Prisma schema if needed → `npx prisma db push`
2. Add Zod validation in `lib/validations.ts`
3. Create API route in `app/api/`
4. Create page/component
5. Update this document

---

## Quick Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run ESLint
npx prisma studio    # Open database GUI
```

---

## Questions? Context?

If you need clarification on:
- **Business logic** - How jobs flow from creation to delivery
- **User roles** - What customers vs admins can do
- **Design decisions** - Why we chose certain approaches
- **Feature priority** - What to build next

Just ask! The goal is to build a simple, functional MVP that helps cabinet makers manage their design projects.
