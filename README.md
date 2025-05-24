# Viral Shorts Generator

An AI-powered platform for generating viral short-form videos using advanced AI models.

## Features

- **Monthly Credit System**: Pro subscribers get 30 credits monthly that roll over (max 200)
- **AI Video Generation**: Create professional videos using AI with custom prompts
- **Dashboard Access Control**: Subscription or credit-based access to the platform
- **Credit Transaction History**: Track all credit income and usage
- **Responsive Design**: Works on desktop and mobile devices

## Subscription Model

### Pro Plan - $100/month
- 30 credits granted on the 1st of each month
- Credits roll over up to 200 total
- Cancel anytime and keep remaining credits
- Priority support

## Environment Variables

Add these to your `.env.local` file:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Monthly Credit Grant (for cron job)
CRON_SECRET=your_secure_random_string

# Other services...
```

## Monthly Credit Grant Setup

The system automatically grants 30 credits to active subscribers on the 1st of each month. You can set this up using:

### Option 1: Cron Job (Recommended)
Set up a cron job to call the API endpoint monthly:

```bash
# Call on the 1st of every month at 9 AM UTC
0 9 1 * * curl -X POST "https://your-domain.com/api/cron/grant-monthly-credits" \
  -H "Authorization: Bearer your_cron_secret"
```

### Option 2: Manual Trigger
You can manually trigger credit grants by calling the API endpoint or using the Convex dashboard to run the `billing.grantMonthlyCredits` mutation.

## Getting Started

1. Clone the repository
2. Install dependencies: `bun install`
3. Set up environment variables
4. Run the development server: `bun run dev`
5. Set up your cron job for monthly credit grants

## API Endpoints

- `GET /api/cron/grant-monthly-credits` - Check grant status
- `POST /api/cron/grant-monthly-credits` - Grant monthly credits (requires auth)

## Architecture

- **Frontend**: Next.js 14 with TypeScript
- **Database**: Convex for real-time data and functions
- **Authentication**: Clerk for user management and subscriptions
- **Billing**: Clerk's subscription system with custom credit logic
- **Styling**: Tailwind CSS with dark mode support

## Credit System Details

- Each video generation costs 1 credit
- Credits never expire once granted
- Monthly credits are capped at 200 total to prevent infinite accumulation
- Credit transactions are logged for full audit trail
- Users retain access to dashboard as long as they have credits or active subscription

## Development

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build
```

## Deployment

1. Deploy to your hosting platform (Vercel, Netlify, etc.)
2. Set up environment variables in production
3. Configure monthly cron job for credit grants
4. Test the subscription flow end-to-end
