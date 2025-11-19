# Development Guide
# LectureAI Developer Setup & Workflow

**Version**: 1.0  
**Last Updated**: November 19, 2025

---

## Prerequisites

### Required Software

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ | Frontend & API |
| Python | 3.11+ | Video processing |
| PostgreSQL | 14+ | Database |
| Redis | 7+ | Queue & cache |
| FFmpeg | 6.0+ | Video encoding |
| Git | Latest | Version control |

### Check Installations

```bash
node --version  # Should be v18+
python3 --version  # Should be 3.11+
psql --version  # Should be 14+
redis-cli --version  # Should be 7+
ffmpeg -version  # Should be 6.0+
```

---

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/lectureai.git
cd lectureai
```

### 2. Install Dependencies

**Frontend**:
```bash
cd frontend
npm install
```

**Backend**:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Environment Variables

**Frontend `.env.local`**:
```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lectureai_dev"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
AWS_ACCESS_KEY_ID="your_key"
AWS_SECRET_ACCESS_KEY="your_secret"
AWS_S3_BUCKET="lectureai-dev"
STRIPE_SECRET_KEY="sk_test_..."
REDIS_URL="redis://localhost:6379"
NEXT_PUBLIC_API_URL="http://localhost:8000"
```

**Backend `.env`**:
```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```bash
OPENAI_API_KEY="sk-..."
ELEVENLABS_API_KEY="..."
AWS_ACCESS_KEY_ID="your_key"
AWS_SECRET_ACCESS_KEY="your_secret"
REDIS_URL="redis://localhost:6379"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lectureai_dev"
```

### 4. Database Setup

**Using Docker**:
```bash
docker-compose up -d postgres redis
```

**Run Migrations**:
```bash
cd frontend
npx prisma migrate dev
npx prisma generate
```

---

## Development Environment

### Option 1: Docker Compose

```bash
# Start all services
docker-compose up

# Services:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
```

### Option 2: Manual Setup

**Terminal 1 - Frontend**:
```bash
cd frontend
npm run dev
# Running on http://localhost:3000
```

**Terminal 2 - Backend API**:
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 3 - Celery Worker**:
```bash
cd backend
source venv/bin/activate
celery -A app.worker worker --loglevel=info
```

---

## Project Structure

```
lectureai/
├── frontend/                 # Next.js application
│   ├── app/                 # App Router
│   │   ├── (auth)/         # Auth pages
│   │   ├── (dashboard)/    # Protected routes
│   │   ├── api/            # API routes
│   │   └── page.tsx        # Landing page
│   ├── components/         # React components
│   ├── lib/                # Utilities
│   ├── hooks/              # Custom hooks
│   └── types/              # TypeScript types
│
├── backend/                 # Python service
│   ├── app/
│   │   ├── main.py         # FastAPI app
│   │   ├── worker.py       # Celery worker
│   │   ├── tasks/          # Background tasks
│   │   └── services/       # External APIs
│   └── requirements.txt
│
├── docs/                    # Documentation
└── docker-compose.yml      # Local setup
```

---

## Development Workflow

### Creating a New Feature

1. **Create Feature Branch**:
```bash
git checkout -b feature/story-mode-templates
```

2. **Write Code**:
```typescript
// components/story-mode/TemplateSelector.tsx
export function TemplateSelector({ onSelect }) {
  // Component logic
  return <div>...</div>
}
```

3. **Write Tests**:
```typescript
// components/TemplateSelector.test.tsx
describe('TemplateSelector', () => {
  it('renders all templates', () => {
    render(<TemplateSelector onSelect={jest.fn()} />)
    expect(screen.getByText('Journey')).toBeInTheDocument()
  })
})
```

4. **Commit & Push**:
```bash
git add .
git commit -m "feat: Add story mode template selector"
git push origin feature/story-mode-templates
```

---

## Testing

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Backend Tests

```bash
cd backend

# Run all tests
pytest

# Run specific test
pytest tests/test_openai_service.py

# Coverage
pytest --cov=app tests/
```

---

## Code Standards

### TypeScript/JavaScript

```typescript
// ✅ DO: Use TypeScript interfaces
interface Video {
  id: string
  title: string
  status: VideoStatus
}

// ❌ DON'T: Use 'any' type
function processVideo(data: any) { }

// ✅ DO: Use async/await
async function uploadSlides(file: File) {
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    return await response.json()
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}
```

### Python

```python
# ✅ DO: Use type hints
def generate_script(slide_text: str, story_mode: bool = False) -> str:
    pass

# ✅ DO: Use proper error handling
try:
    result = openai_service.generate_script(text)
    logger.info(f"Generated script")
    return result
except Exception as exc:
    logger.error(f"Failed: {str(exc)}")
    raise
```

---

## Debugging

### Frontend Debugging

**VS Code Launch Config**:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    }
  ]
}
```

### Backend Debugging

```python
import pdb

def generate_script(slide_text):
    pdb.set_trace()  # Breakpoint
    script = openai_service.call(slide_text)
    return script
```

### Database Debugging

```bash
# Prisma Studio (GUI)
npx prisma studio
# Opens at http://localhost:5555
```

---

## Common Tasks

### Add New API Endpoint

```typescript
// app/api/custom-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'

export async function GET(req: NextRequest) {
  const { userId } = auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Your logic here
  return NextResponse.json({ success: true, data: result })
}
```

### Add Database Field

```bash
# 1. Update Prisma schema
# prisma/schema.prisma

# 2. Create migration
npx prisma migrate dev --name add_custom_field

# 3. Generate client
npx prisma generate
```

### Add Celery Task

```python
# app/tasks/custom_task.py
from celery import shared_task

@shared_task(bind=True, max_retries=3)
def custom_task(self, data: dict):
    try:
        result = process_data(data)
        return result
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Check PostgreSQL
sudo service postgresql status

# Restart
sudo service postgresql restart

# Reset database
npx prisma migrate reset
```

### Redis Connection Issues

```bash
# Check Redis
redis-cli ping
# Should return: PONG

# Restart
redis-server --daemonize yes
```

---

**Version**: 1.0  
**Last Updated**: November 19, 2025
