# Deployment Guide
# LectureAI Production Deployment

**Version**: 1.0  
**Last Updated**: November 19, 2025

---

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Code linted
- [ ] No console.log statements
- [ ] Environment variables documented

### Security
- [ ] All API endpoints authenticated
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] HTTPS enforced
- [ ] Secrets in environment variables

### Performance
- [ ] Images optimized
- [ ] Database indexes created
- [ ] API response times < 500ms
- [ ] Video generation < 5 minutes

---

## Infrastructure Setup

### Recommended Stack

**Cost Estimate**: ~$100-150/month for MVP

| Service | Purpose | Plan | Cost |
|---------|---------|------|------|
| Vercel | Frontend + API | Pro | $20/mo |
| Railway | Python Workers | Pro | $20-50/mo |
| Supabase | PostgreSQL | Pro | $25/mo |
| Upstash | Redis | Pay-as-you-go | $10-20/mo |
| AWS S3 | File Storage | Pay-as-you-go | $10-30/mo |
| Clerk | Authentication | Pro | $25/mo |

---

## 1. Vercel Setup (Frontend + API)

### Install Vercel CLI

```bash
npm install -g vercel
```

### Connect Repository

```bash
cd frontend
vercel link
```

### Set Environment Variables

```bash
# Via CLI
vercel env add DATABASE_URL production
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
# ... add all required env vars
```

**Required Environment Variables**:
```bash
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
STRIPE_SECRET_KEY="sk_live_..."
REDIS_URL="redis://..."
NEXT_PUBLIC_API_URL="https://api.lectureai.com"
```

### Deploy

```bash
# Production deployment
vercel --prod

# Preview deployment
vercel
```

---

## 2. Railway Setup (Python Workers)

### Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

### Create Project

```bash
cd backend
railway init
railway link
```

### Dockerfile for Production

```dockerfile
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["celery", "-A", "app.worker", "worker", "--loglevel=info", "--concurrency=4"]
```

### Set Environment Variables

```bash
railway variables set OPENAI_API_KEY="sk-..."
railway variables set ELEVENLABS_API_KEY="..."
railway variables set AWS_ACCESS_KEY_ID="..."
railway variables set REDIS_URL="redis://..."
```

### Deploy

```bash
railway up
```

---

## 3. Supabase Setup (Database)

### Create Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create new project
3. Choose region (us-east-1)
4. Set database password

### Run Migrations

```bash
cd frontend
export DATABASE_URL="postgresql://..."
npx prisma migrate deploy
npx prisma generate
```

---

## 4. AWS S3 Setup (Storage)

### Create Bucket

```bash
aws s3 mb s3://lectureai-production --region us-east-1
```

### Configure CORS

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://lectureai.com"],
    "MaxAgeSeconds": 3000
  }
]
```

### Configure Lifecycle Policy

```json
{
  "Rules": [
    {
      "Id": "DeleteTempFiles",
      "Status": "Enabled",
      "Prefix": "processing/",
      "Expiration": {
        "Days": 7
      }
    }
  ]
}
```

---

## 5. Clerk Setup (Authentication)

### Production Instance

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create production instance
3. Configure email/password + Google OAuth

### Get API Keys

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
```

### Configure Webhooks

```bash
# Webhook URL
https://lectureai.com/api/webhooks/clerk

# Events:
- user.created
- user.updated
- user.deleted
```

---

## 6. Stripe Setup (Payments)

### Production Mode

1. Activate Stripe account
2. Get live API keys

```bash
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
```

### Create Products

```bash
# Pro Plan
stripe products create \
  --name "Pro Plan" \
  --description "50 videos/month"

stripe prices create \
  --product prod_ABC123 \
  --unit-amount 2900 \
  --currency usd \
  --recurring interval=month
```

### Configure Webhooks

```bash
# Webhook URL
https://lectureai.com/api/webhooks/stripe

# Events:
- customer.subscription.created
- customer.subscription.updated
- invoice.payment_succeeded
```

---

## CI/CD with GitHub Actions

**.github/workflows/deploy-production.yml**:

```yaml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
      - name: Run tests
        run: cd frontend && npm ci && npm test

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'
          
  deploy-workers:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
```

---

## Database Migration

### Pre-Deployment

```bash
# Generate migration preview
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource $DATABASE_URL \
  --script > migration.sql

# Review migration.sql
```

### Deployment

```bash
# Run migrations
DATABASE_URL=$PRODUCTION_DATABASE_URL npx prisma migrate deploy

# Verify
npx prisma validate
```

---

## Monitoring Setup

### Sentry (Error Tracking)

```typescript
// frontend/sentry.client.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
})
```

### Health Checks

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    await redis.ping()
    
    return NextResponse.json({
      status: 'healthy',
      services: {
        database: 'up',
        redis: 'up'
      }
    })
  } catch (error) {
    return NextResponse.json({ status: 'unhealthy' }, { status: 503 })
  }
}
```

---

## SSL & Domain Setup

### Custom Domain (Vercel)

```bash
# Add domain in Vercel Dashboard
# Vercel automatically provisions SSL

# DNS records:
# A record: @ -> 76.76.21.21
# CNAME: www -> cname.vercel-dns.com
```

---

## Backup & Recovery

### Database Backups

```bash
# Automated (Supabase Pro)
# - Daily backups (7 days retention)

# Manual backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup_20251119.sql
```

### S3 Backups

```bash
# Enable versioning
aws s3api put-bucket-versioning \
  --bucket lectureai-production \
  --versioning-configuration Status=Enabled
```

---

## Rollback Procedures

### Vercel Rollback

```bash
# Via CLI
vercel rollback

# Via Dashboard: Select previous deployment -> Promote
```

### Railway Rollback

```bash
railway rollback
```

---

## Scaling

### Horizontal Scaling

**Vercel**: Auto-scales (no configuration needed)

**Railway Workers**:
```bash
# Scale via CLI
railway scale --replicas 5
```

### Database Scaling

**Supabase**: Upgrade plan for more resources

---

## Post-Deployment Checklist

- [ ] All services running
- [ ] Database migrations applied
- [ ] DNS propagated
- [ ] SSL certificate valid
- [ ] Webhooks receiving events
- [ ] Error tracking working
- [ ] Backups configured
- [ ] Monitoring alerts configured

---

**Version**: 1.0  
**Last Updated**: November 19, 2025
