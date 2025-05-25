# Viral Shorts Generator

A Next.js application for creating viral YouTube shorts using AI video generation powered by Fal.ai's Kling V2 Master model.

## Tech Stack

- Next.js 15 + React 19 + TypeScript
- Convex (backend/database)
- Clerk (authentication)
- Fal.ai (AI video generation)
- Tailwind CSS

## 🚀 Deploy to Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftfcbot%2Fviral-shorts-generator&env=NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,CLERK_SECRET_KEY,CONVEX_DEPLOY_KEY&envDescription=API%20keys%20needed%20for%20authentication%20and%20AI%20video%20generation&envLink=https%3A%2F%2Fgithub.com%2Ftfcbot%2Fviral-shorts-generator%23setup-instructions)

## Setup Instructions

### 1. Clone this repository

### 2. Set up Convex Backend
```bash
npm install -g convex
npx convex deploy
```
Copy the deployment URL and add it as `CONVEX_DEPLOYMENT` to your Vercel environment variables.

### 3. Set up Clerk Authentication
- Create account at [clerk.com](https://clerk.com)
- Create new application
- Get publishable key and secret key
- Create JWT template named "convex"
- Get the JWT issuer domain

### 4. Set up Fal.ai
- Create account at [fal.ai](https://fal.ai)
- Get your API key from dashboard

### 5. Deploy to Vercel
Click the deploy button above and add these environment variables:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-domain.clerk.accounts.dev
FAL_KEY=your-fal-api-key
```

### 6. Configure Authentication
- In Convex dashboard: Add Clerk JWT issuer domain
- In Clerk dashboard: Set production domain

## Local Development

1. Clone and install:
```bash
git clone <repository-url>
cd viral-shorts-generator
bun install
```

2. Create `.env.local` with the environment variables above

3. Start development:
```bash
bun run dev
```

## Project Structure

```
app/
├── dashboard/studio/    # Video generation
├── dashboard/videos/    # Video management
├── pricing/            # Pricing page
└── page.tsx           # Landing page

convex/
├── videoActions.ts    # Fal.ai integration
├── videos.ts         # Database functions
└── schema.ts         # Database schema
```

## Resources

- [Convex Docs](https://docs.convex.dev)
- [Clerk Docs](https://clerk.dev/docs)
- [Fal.ai Docs](https://fal.ai/models/fal-ai/kling-video)
- [Next.js Docs](https://nextjs.org/docs)
