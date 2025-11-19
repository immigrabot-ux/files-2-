# System Architecture
# LectureAI Technical Design Document

**Version**: 1.0  
**Last Updated**: November 19, 2025  
**Status**: Approved

---

## High-Level Architecture

LectureAI follows a modern microservices-inspired architecture with clear separation of concerns:

- **Frontend Layer**: Next.js React application (SSR + Client-side)
- **API Layer**: Next.js API routes for business logic
- **Processing Layer**: Python FastAPI + Celery workers for video generation
- **Data Layer**: PostgreSQL database, Redis cache
- **Storage Layer**: AWS S3 for files and videos
- **External Services**: OpenAI, ElevenLabs, Stripe

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Browser    │  │    Mobile    │  │   Desktop    │         │
│  │   (React)    │  │  (Responsive)│  │(Responsive)  │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
│         └──────────────────┴──────────────────┘                 │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER (Next.js)                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Pages: Landing, Dashboard, Create, Videos, Settings       │ │
│  │  Components: Upload, Editor, VideoPlayer, Pricing          │ │
│  │  State: React Query + Zustand                              │ │
│  │  Styling: TailwindCSS + shadcn/ui                          │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │ API Calls
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API LAYER (Next.js API Routes)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   /api/      │  │   /api/      │  │   /api/      │         │
│  │   upload     │  │   generate   │  │   videos     │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
│  ┌──────┴────────┐  ┌─────┴──────┐  ┌───────┴────────┐        │
│  │ Authentication│  │ Validation │  │  Business      │        │
│  │   (Clerk)     │  │   Layer    │  │  Logic         │        │
│  └───────────────┘  └────────────┘  └────────────────┘        │
└────┬───────────────────┬────────────────────┬──────────────────┘
     │                   │                    │
     ▼                   ▼                    ▼
┌─────────┐      ┌──────────────┐    ┌──────────────┐
│Database │      │    Queue     │    │   Storage    │
│(Postgres)│     │   (Redis)    │    │   (AWS S3)   │
└─────────┘      └──────┬───────┘    └──────────────┘
                        │
                        │ Job Queue
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│               PROCESSING LAYER (Python + Celery)                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Celery Workers                         │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐           │   │
│  │  │  Parse    │  │  Script   │  │  Voice    │           │   │
│  │  │  Slides   │  │  Generate │  │  Generate │           │   │
│  │  └───────────┘  └───────────┘  └───────────┘           │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐           │   │
│  │  │  Video    │  │  Cleanup  │  │  Notify   │           │   │
│  │  │  Render   │  │  Tasks    │  │  User     │           │   │
│  │  └───────────┘  └───────────┘  └───────────┘           │   │
│  └──────────────────────────────────────────────────────────┘   │
└────┬───────────────────┬────────────────────┬──────────────────┘
     │                   │                    │
     ▼                   ▼                    ▼
┌──────────┐      ┌──────────┐        ┌──────────┐
│  OpenAI  │      │ElevenLabs│        │  FFmpeg  │
│   API    │      │   API    │        │  Local   │
└──────────┘      └──────────┘        └──────────┘
```

---

## Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **React 18**: UI library
- **TypeScript**: Type safety
- **TailwindCSS**: Styling framework
- **shadcn/ui**: Component library
- **React Query**: Server state management
- **Zustand**: Client state management

### Backend
- **Next.js API Routes**: Web API endpoints
- **Python 3.11**: Video processing
- **FastAPI**: Python API framework
- **Celery**: Distributed task queue

### Database & Storage
- **PostgreSQL 14+**: Primary database
- **Prisma**: ORM
- **Redis**: Cache & queue
- **AWS S3**: File storage

### External Services
- **Clerk**: Authentication
- **Stripe**: Payments
- **OpenAI GPT-4o**: Script generation
- **ElevenLabs**: Voiceover generation
- **SendGrid**: Transactional email
- **Sentry**: Error tracking

### Video Processing
- **FFmpeg**: Video encoding
- **moviepy**: Python video library
- **python-pptx**: PowerPoint parsing
- **PyPDF2**: PDF parsing

---

## Data Flow: Video Creation

```
1. USER UPLOADS SLIDES
   ↓
   Frontend validates file
   ↓
   API uploads to S3
   ↓
   Database creates video record
   ↓
2. PARSE SLIDES
   ↓
   Celery worker extracts text
   ↓
   Store slide data in database
   ↓
3. GENERATE SCRIPTS
   ↓
   OpenAI API generates scripts
   ↓
   Store in database (editable)
   ↓
4. USER CONFIRMS
   ↓
5. GENERATE VOICEOVERS
   ↓
   ElevenLabs creates audio
   ↓
   Upload audio to S3
   ↓
6. RENDER VIDEO
   ↓
   FFmpeg combines slides + audio
   ↓
   Upload video to S3
   ↓
   Update database status
   ↓
7. NOTIFY USER
   ↓
8. USER DOWNLOADS
```

---

## Component Details

### Frontend Application

**File Structure**:
```
frontend/
├── app/
│   ├── (auth)/              # Auth pages
│   ├── (dashboard)/         # Protected routes
│   ├── api/                 # API routes
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                  # shadcn components
│   ├── upload/
│   ├── editor/
│   └── dashboard/
├── lib/
│   ├── db.ts               # Prisma client
│   ├── auth.ts             # Clerk helpers
│   └── utils.ts
├── hooks/
└── types/
```

**State Management**:
```typescript
// React Query for server state
const { data, isLoading } = useQuery({
  queryKey: ['videos'],
  queryFn: fetchVideos
})

// Zustand for client state
const useVideoStore = create((set) => ({
  currentVideo: null,
  setCurrentVideo: (video) => set({ currentVideo: video })
}))
```

### API Layer

**Structure**:
```
/api/
├── upload/
├── generate/
│   ├── script/
│   └── voice/
├── videos/
│   ├── [id]/
│   └── render/
├── user/
└── webhooks/
```

**Authentication**:
```typescript
// All protected routes require auth
export async function GET(req: NextRequest) {
  const { userId } = auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Process request...
}
```

### Processing Layer

**Celery Configuration**:
```python
app = Celery(
    'lectureai',
    broker=os.getenv('REDIS_URL'),
    backend=os.getenv('REDIS_URL')
)

app.conf.update(
    task_serializer='json',
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes max
    worker_max_tasks_per_child=50
)
```

**Task Example**:
```python
@shared_task(bind=True, max_retries=3)
def render_video(self, video_id: str, settings: dict):
    try:
        # Video processing logic
        result = process_video(video_id, settings)
        return result
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)
```

---

## Database Schema

### Core Tables

**users**
- id, email, subscription_tier, stripe_customer_id
- Managed by Clerk, synced via webhook

**videos**
- id, user_id, title, status, video_url
- Status: uploaded, parsing, script_ready, rendering, completed

**scripts**
- id, video_id, slide_number, content
- Editable by user

**audio_files**
- id, video_id, slide_number, audio_url

**usage_stats**
- user_id, month, videos_created, storage_used

---

## Infrastructure

### Development
- Docker Compose for local services
- LocalStack for S3 simulation
- PostgreSQL + Redis in containers

### Production (Recommended)
- **Vercel**: Frontend + API ($20/mo)
- **Railway**: Python workers ($20-50/mo)
- **Supabase**: PostgreSQL ($25/mo)
- **Upstash**: Redis ($10-20/mo)
- **AWS S3**: Storage ($10-30/mo)

**Total**: ~$100-150/mo

---

## Security Architecture

### Authentication Flow
1. User signs up/logs in via Clerk
2. JWT token issued
3. Token verified on each API request
4. User ID extracted for authorization

### Data Protection
- **At Rest**: S3 server-side encryption, RDS encryption
- **In Transit**: TLS 1.3, HTTPS only
- **API Security**: Rate limiting, input validation

### GDPR Compliance
- User data deletion endpoint
- Data export functionality
- Privacy policy enforcement

---

## Scaling Strategy

### Horizontal Scaling
- **Frontend**: Vercel auto-scales
- **Workers**: Railway auto-scaling (2-10 replicas)
- **Database**: Read replicas for heavy queries

### Performance Optimization
- Redis caching for frequent queries
- CDN for static assets (CloudFront)
- Database indexes on common queries
- Connection pooling

---

## Monitoring & Observability

### Error Tracking
- **Sentry**: Application errors
- **CloudWatch**: Infrastructure logs

### Metrics
- Video generation duration
- API response times
- Worker utilization
- Storage costs

### Health Checks
```typescript
// /api/health
{
  status: 'healthy',
  services: {
    database: 'up',
    redis: 'up'
  }
}
```

---

## Disaster Recovery

### Backups
- **Database**: Daily automated (Supabase)
- **S3**: Versioning + cross-region replication

### Recovery Procedures
- Database point-in-time recovery (7 days)
- Application rollback via Vercel/Railway
- Cache rebuild from source

---

**Version**: 1.0  
**Last Updated**: November 19, 2025  
**Next Review**: December 19, 2025
