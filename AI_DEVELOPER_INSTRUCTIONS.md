# AI Developer Instructions
# LectureAI - Instructions for AI Coding Assistants

**Purpose**: This document provides specific instructions for AI coding assistants (Claude, Cursor, GitHub Copilot, etc.) to help build and maintain LectureAI efficiently.

**Version**: 1.0  
**Last Updated**: November 19, 2025

---

## Core Directives

### Primary Mission

You are building **LectureAI**, a SaaS platform that converts educational slide decks into professional lecture videos with AI-generated voiceovers and optional storytelling enhancements.

### Key Principles

1. **Follow the PRD**: All features must match specifications in `docs/PRD.md`
2. **Type Safety First**: Use TypeScript for frontend, type hints for Python
3. **Test-Driven**: Write tests before or alongside implementation
4. **Error Handling**: Never expose internal errors to users
5. **Performance**: Keep API responses under 500ms (p95)
6. **Security**: Validate all inputs, authenticate all requests

### Tech Stack (DO NOT DEVIATE)

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, TailwindCSS
- **Backend**: Python 3.11, FastAPI, Celery
- **Database**: PostgreSQL 14+, Prisma ORM
- **Storage**: AWS S3
- **Auth**: Clerk
- **Payments**: Stripe
- **Queue**: Redis + BullMQ/Celery

---

## Project Context

### What LectureAI Does

```
INPUT: PowerPoint/PDF slides
   ↓
STEP 1: Parse slides → extract text
STEP 2: Generate lecture scripts (Normal or Story Mode)
STEP 3: Create AI voiceovers
STEP 4: Render video with transitions
   ↓
OUTPUT: Downloadable MP4 video
```

### Unique Differentiator: Story Mode

**Critical**: Story Mode is what sets us apart. It transforms dry educational content into engaging narratives using 5 templates:

1. Journey
2. Problem-Solution
3. Historical Timeline
4. Debate
5. Mystery

---

## Code Generation Guidelines

### TypeScript/React Guidelines

```typescript
// ✅ DO: Use TypeScript interfaces
interface Video {
  id: string
  title: string
  status: VideoStatus
}

// ❌ DON'T: Use 'any' type
function processVideo(data: any) { } // NEVER

// ✅ DO: Use proper imports
import { Button } from '@/components/ui/button'

// ❌ DON'T: Use relative imports for components
import { Button } from '../../components/ui/button'

// ✅ DO: Use async/await with error handling
async function uploadSlides(file: File) {
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}

// ✅ DO: Use React Query for server state
const { data, isLoading } = useQuery({
  queryKey: ['videos'],
  queryFn: fetchVideos
})
```

### Python Guidelines

```python
# ✅ DO: Use type hints
def generate_script(slide_text: str, story_mode: bool = False) -> str:
    pass

# ❌ DON'T: Omit type hints
def generate_script(slide_text, story_mode=False):
    pass

# ✅ DO: Use proper error handling
try:
    result = openai_service.generate_script(text)
    logger.info(f"Generated script")
    return result
except Exception as exc:
    logger.error(f"Failed: {str(exc)}")
    raise

# ✅ DO: Use Celery tasks for long operations
@shared_task(bind=True, max_retries=3)
def render_video(self, video_id: str, settings: dict):
    try:
        # Long-running processing
        pass
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)
```

---

## File Creation Rules

### When to Create New Files

Always create a new file when:
- Implementing a new React component
- Adding a new API route
- Creating a new Celery task
- Adding a new service

### File Naming Conventions

```
Frontend:
✅ components/upload/FileUploader.tsx
✅ app/api/videos/route.ts
✅ hooks/useVideoCreation.ts

Backend:
✅ app/tasks/generate_script.py
✅ app/services/openai_service.py
✅ tests/test_script_generation.py
```

### File Structure Templates

#### React Component Template

```typescript
// components/story-mode/TemplateSelector.tsx
'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'

interface TemplateSelectorProps {
  onSelect: (templateId: string) => void
  selectedTemplate?: string
}

export function TemplateSelector({ onSelect, selectedTemplate }: TemplateSelectorProps) {
  // Component logic
  
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

#### API Route Template

```typescript
// app/api/videos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const video = await prisma.video.findUnique({
      where: { id: params.id, userId }
    })
    
    if (!video) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, data: video })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

---

## Testing Requirements

### Write Tests for Every Feature

```typescript
// components/TemplateSelector.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { TemplateSelector } from './TemplateSelector'

describe('TemplateSelector', () => {
  it('renders all templates', () => {
    render(<TemplateSelector onSelect={jest.fn()} />)
    expect(screen.getByText('Journey')).toBeInTheDocument()
  })

  it('calls onSelect when template is clicked', () => {
    const onSelect = jest.fn()
    render(<TemplateSelector onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Journey'))
    expect(onSelect).toHaveBeenCalledWith('journey')
  })
})
```

---

## Error Handling Patterns

### API Error Responses

```typescript
// Always use this structure
return NextResponse.json(
  {
    success: false,
    error: {
      code: 'VIDEO_NOT_FOUND',
      message: 'Video with ID xyz not found'
    }
  },
  { status: 404 }
)
```

### User-Facing Error Messages

```typescript
// ✅ DO: Helpful, actionable errors
"Unable to upload file. Please ensure it's a valid PowerPoint or PDF under 100MB."

// ❌ DON'T: Technical errors
"Error: ENOENT: no such file or directory"
```

---

## Common Tasks

### Task 1: Add New API Endpoint

```typescript
// 1. Create file: app/api/your-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await req.json()
    // Your logic
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

### Task 2: Add Database Field

```bash
# 1. Update Prisma schema
model Video {
  // ... existing fields
  newField String?
}

# 2. Create migration
npx prisma migrate dev --name add_new_field

# 3. Generate client
npx prisma generate
```

### Task 3: Add Celery Task

```python
# 1. Create file: app/tasks/new_task.py
from celery import shared_task

@shared_task(bind=True, max_retries=3)
def new_task(self, param: str):
    try:
        result = process(param)
        return result
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)
```

---

## Anti-Patterns to Avoid

### ❌ DON'T: Mix Server and Client Components

```typescript
// ❌ WRONG
'use client'

import { prisma } from '@/lib/db'

export default async function Page() {
  const data = await prisma.video.findMany() // ERROR!
  return <div>{data}</div>
}

// ✅ CORRECT
export default async function Page() {
  const data = await prisma.video.findMany()
  return <ClientComponent data={data} />
}
```

### ❌ DON'T: Expose Secrets in Client Code

```typescript
// ❌ WRONG
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY) // LEAKED!

// ✅ CORRECT: Use in API routes only
```

### ❌ DON'T: Use localStorage in Artifacts

```typescript
// ❌ WRONG: localStorage not supported
localStorage.setItem('data', JSON.stringify(data))

// ✅ CORRECT: Use React state
const [data, setData] = useState(initialData)
```

---

## Special Instructions for Story Mode

### Story Mode is Critical

When implementing Story Mode:

1. Read the PRD section on Story Mode first
2. Use the exact templates defined
3. Test with real educational content
4. Compare Normal vs Story Mode outputs

### Story Mode Prompts

```python
STORY_MODE_PROMPT_TEMPLATE = """
You are an expert educational storyteller.

ORIGINAL CONTENT:
{slide_text}

TEMPLATE: {template_type}
INTENSITY: {intensity_level}

Transform this into an engaging {template_type} story that teaches.
Maintain 100% accuracy. Length: 60-90 seconds (150-225 words).
"""
```

---

## Checklist Before Submitting Code

- [ ] Code follows existing patterns
- [ ] TypeScript types defined (no 'any')
- [ ] Python type hints added
- [ ] Error handling implemented
- [ ] Input validation added
- [ ] Tests written and passing
- [ ] No console.log statements
- [ ] No secrets exposed
- [ ] Linter passes
- [ ] Feature matches PRD

---

## Final Reminder

**You are building a product that helps educators create better learning experiences.**

Every feature should:
- Work reliably
- Be user-friendly
- Perform efficiently
- Handle errors gracefully
- Follow security best practices

When in doubt, ask: **"Would this help Sarah, Prof. James, or Mike achieve their goals?"**

---

**Version**: 1.0  
**Last Updated**: November 19, 2025  
**For**: Claude, Cursor, GitHub Copilot, and future coding assistants
