# LectureAI - AI-Powered Lecture Video Generator

Transform slide decks into professional lecture videos with AI voiceover and storytelling in minutes.

## 🎯 Product Vision

LectureAI enables course creators, educators, and trainers to create engaging video content 10x faster by automating the entire video production process from slides to finished video.

## 📊 Market Opportunity

- **Market Size**: $251B online courses market growing to $1,080B by 2032 (17.58% CAGR)
- **Target Users**: 175,000+ course creators on platforms like Udemy, Teachable, Thinkific
- **Problem**: Course creators spend 8+ hours per video on recording and editing
- **Solution**: Generate professional videos in 2 minutes with AI

## ✨ Core Features

### MVP (Phase 1)
- Upload PowerPoint/PDF slides
- AI script generation from slide content
- **Story Mode**: Transform content into engaging narratives
- AI voiceover in 10+ professional voices
- Automated video rendering with transitions
- User authentication and dashboard
- Subscription tiers (Free, Pro, Business)

### Phase 2
- Visual enhancements (annotations, zoom effects)
- Custom branding (logo, intro/outro)
- Team collaboration workspaces
- LMS integrations (Teachable, Thinkific, Kajabi)
- API access

## 🏗️ Tech Stack

**Frontend**
- Next.js 14 (App Router)
- React 18 + TypeScript
- TailwindCSS + shadcn/ui
- React Query for data fetching

**Backend**
- Next.js API Routes (web API)
- Python FastAPI (video processing)
- PostgreSQL (Supabase)
- Redis + BullMQ (job queue)

**External Services**
- OpenAI GPT-4o (script generation)
- ElevenLabs (voiceover)
- AWS S3 (file storage)
- Stripe (payments)
- Clerk (authentication)

**Video Processing**
- FFmpeg (video encoding)
- Python: moviepy, python-pptx, PyPDF2
- Celery (background workers)

## 📁 Project Structure

```
lectureai/
├── frontend/                 # Next.js application
│   ├── app/                 # Next.js 14 App Router
│   │   ├── (auth)/         # Authentication pages
│   │   ├── (dashboard)/    # Protected dashboard pages
│   │   ├── api/            # API routes
│   │   └── page.tsx        # Landing page
│   ├── components/         # React components
│   ├── lib/                # Utilities and helpers
│   └── hooks/              # Custom React hooks
│
├── backend/                 # Python video processor
│   ├── app/
│   │   ├── main.py         # FastAPI application
│   │   ├── worker.py       # Celery worker
│   │   ├── tasks/          # Background tasks
│   │   └── services/       # External API services
│   └── requirements.txt
│
├── database/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Database migrations
│
├── docs/                    # This documentation
└── docker-compose.yml      # Local development setup
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 14+
- Redis
- FFmpeg

### Installation

1. **Clone repository**
```bash
git clone https://github.com/yourusername/lectureai.git
cd lectureai
```

2. **Set up frontend**
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your API keys
npm run dev
```

3. **Set up backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
uvicorn app.main:app --reload
```

4. **Run workers**
```bash
cd backend
celery -A app.worker worker --loglevel=info
```

5. **Access application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 🔑 Environment Variables

### Frontend (.env.local)
```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""

# AWS S3
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="us-east-1"
AWS_S3_BUCKET=""

# Stripe
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""

# Backend URL
NEXT_PUBLIC_API_URL="http://localhost:8000"
```

### Backend (.env)
```bash
# OpenAI
OPENAI_API_KEY=""

# ElevenLabs
ELEVENLABS_API_KEY=""

# AWS S3
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""

# Redis
REDIS_URL="redis://localhost:6379"

# Database
DATABASE_URL="postgresql://..."
```

## 📖 Documentation

- [Product Requirements](./docs/PRD.md)
- [Technical Architecture](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [User Stories](./docs/USER_STORIES.md)
- [Development Guide](./docs/DEVELOPMENT.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🗓️ Development Timeline

**Weeks 1-2**: Foundation & Setup
**Weeks 3-4**: Core Video Generation
**Weeks 5-6**: Rendering & Queue System
**Weeks 7-8**: Story Mode & Polish
**Weeks 9-10**: Payments & Launch Prep
**Weeks 11-12**: Testing & Beta Launch

Target: 8-week MVP, 12-week public launch

## 💰 Pricing

| Feature | Free | Pro ($29/mo) | Business ($79/mo) |
|---------|------|--------------|-------------------|
| Videos/month | 5 | 50 | 200 |
| Max slides | 20 | 100 | Unlimited |
| Watermark | Yes | No | No |
| Resolution | 720p | 1080p | 4K |
| Storage | 2GB | 50GB | 200GB |
| Story Mode | ✓ | ✓ | ✓ |
| Custom Branding | ✗ | ✓ | ✓ |
| Team Access | ✗ | ✗ | ✓ (5 seats) |
| Priority Support | ✗ | ✗ | ✓ |

## 🎯 Success Metrics

**Month 1**: 100 signups, 50 videos, 10 paying customers
**Month 3**: 500 signups, 500 videos, 50 paying ($1,450 MRR)
**Month 6**: 2,000 signups, 3,000 videos, 200 paying ($5,800 MRR)

## 🤝 Contributing

This is a closed-source commercial project. For team members:
1. Create feature branch from `main`
2. Follow coding standards (see DEVELOPMENT.md)
3. Write tests for new features
4. Submit PR with detailed description
5. Get approval from tech lead

## 📄 License

Proprietary - All Rights Reserved

## 📞 Support

- Email: support@lectureai.com
- Documentation: https://docs.lectureai.com
- Status: https://status.lectureai.com

---

Built with ❤️ by the LectureAI team
