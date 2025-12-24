# CabinetViz Portal

A full-stack Next.js customer portal for cabinet visualization services. Allows tradespeople to submit jobs, upload files, track progress, and download completed 3D renders and technical drawings.

## Features

### Customer Features
- 🔐 **User Authentication** - Register, login, secure sessions with JWT
- 📋 **Job Management** - Create jobs with detailed requirements
- 📤 **File Uploads** - Upload sketches, measurements, photos, floor plans
- 📊 **Progress Tracking** - Real-time status updates and progress bars
- 📥 **Downloads** - Download completed renders and drawings
- 💬 **Comments** - Communicate with designers on each job
- 🔔 **Notifications** - Get notified when deliverables are ready

### Admin Features (future)
- 👥 **Customer Management** - View all customers and their jobs
- ✏️ **Job Updates** - Update status, progress, add deliverables
- 📎 **Deliverable Uploads** - Upload 3D renders and technical drawings
- 💰 **Quotes** - Send quotes to customers

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: JWT (jose + bcryptjs)
- **Styling**: Tailwind CSS
- **File Uploads**: Native FormData + fs
- **Validation**: Zod

## Project Structure

```
cabinetviz-portal/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── register/route.ts
│   │   ├── jobs/route.ts
│   │   └── upload/route.ts
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── jobs/
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── dashboard/
│   └── jobs/
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── utils.ts
│   └── validations.ts
├── prisma/
│   └── schema.prisma
├── public/
│   └── uploads/
├── .env.example
├── next.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (or SQLite for development)
- npm or yarn

### Installation

1. **Clone and install dependencies**

```bash
cd cabinetviz-portal
npm install
```

2. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` with your database URL and JWT secret:

```env
# For PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/cabinetviz?schema=public"

# Or for SQLite (easier for development)
DATABASE_URL="file:./dev.db"

# Generate a secure random string for production
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

3. **Set up the database**

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

4. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Main Models

- **User** - Customer accounts with authentication
- **Job** - Cabinet design projects
- **JobFile** - Uploaded files (sketches, photos, etc.)
- **Deliverable** - Completed outputs (renders, drawings)
- **Comment** - Communication on jobs
- **StatusHistory** - Job status tracking
- **Notification** - User notifications

### Job Statuses

| Status | Description |
|--------|-------------|
| PENDING | Waiting for review |
| QUOTED | Quote sent, awaiting approval |
| IN_PROGRESS | Design work started |
| REVIEW | Ready for customer review |
| REVISION | Customer requested changes |
| COMPLETED | Finished and delivered |
| CANCELLED | Job cancelled |

### Project Types

- Kitchen
- Wardrobe
- Bathroom Vanity
- Entertainment Unit
- Home Office
- Laundry
- Custom

## API Endpoints

### Authentication

```
POST /api/auth/register - Create new account
POST /api/auth/login    - Sign in
```

### Jobs

```
GET  /api/jobs          - List user's jobs
POST /api/jobs          - Create new job
GET  /api/jobs/[id]     - Get job details
PUT  /api/jobs/[id]     - Update job
```

### Files

```
POST /api/upload        - Upload file to job
GET  /api/upload        - List job files
```

## Customization

### Adding New Project Types

Edit `prisma/schema.prisma`:

```prisma
enum ProjectType {
  KITCHEN
  WARDROBE
  // Add new types here
  PANTRY
  BUTLER_PANTRY
}
```

Then run `npx prisma db push`

### Styling

The project uses Tailwind CSS. Main theme colors are defined in:
- `tailwind.config.js` - Color palette
- `app/globals.css` - Component classes

### Email Notifications

To enable email notifications, add SMTP configuration to `.env` and implement in `lib/email.ts`.

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
CMD ["npm", "start"]
```

## Future Enhancements

- [ ] Admin dashboard
- [ ] Email notifications
- [ ] Payment integration (Stripe)
- [ ] Real-time updates (WebSockets)
- [ ] Mobile app (React Native)
- [ ] Remotion video generation for 3D walkthroughs
- [ ] AI-powered design suggestions

## License

MIT

---

Built with ❤️ for cabinet makers and joiners.
