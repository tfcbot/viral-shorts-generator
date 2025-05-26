# Viral Shorts Generator

A Next.js application for creating viral YouTube shorts using AI video generation powered by Fal.ai's Kling V2 Master model.

## Tech Stack

- Next.js 15 + React 19 + TypeScript
- Convex (backend/database)
- Clerk (authentication)
- Fal.ai (AI video generation)
- Tailwind CSS
## Setup Instructions

### 1. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftfcbot%2Fviral-shorts-generator&env=NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,CLERK_SECRET_KEY,CONVEX_DEPLOY_KEY&envDescription=API%20keys%20needed%20for%20authentication%20and%20AI%20video%20generation&envLink=https%3A%2F%2Fgithub.com%2Ftfcbot%2Fviral-shorts-generator%23setup-instructions)

You will need to add in environment variables before deploying 

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CONVEX_DEPLOY_KEY=convex_key
```
### 2. Set up Clerk

1. Create a Clerk application at [clerk.com](https://clerk.com/)
2. Go to API Keys and copy the NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to add to vercel
3. In your Clerk dashboard, create a new JWT template for Convex:
    - Go to JWT Templates → Add new and select Convex
4. Enable billing and create a pro plan. Go to the subscriptions follow the instructions there. 


### 3. Set up Convex
1. Create account at [convex.dev](https://convex.dev)
2. Create new project
3. In the project settings →  URL & Deploy Key, generate the deploy key. 
4. Copy that into the vercel deployment
5. In settings →  environment variables add CLERK_JWT_ISSUER_DOMAIN. 
    - You can grab this from the JWT Template its called `issuer`
6. Add FAL_KEY as an environment variable. 
    - Create account at [fal.ai](https://fal.ai)
    - Get your API key from dashboard
    

### 5. Update the Vercel Build Command

After you have added the environment variables to vercel, the first deployment will fail. That is because vercel needs to know how to deploy convex. 

1. Go the project settings page 
2. Go to Build and Deployment 
3. Overide the build command with `npx convex deploy --cmd='npm run build'`


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
