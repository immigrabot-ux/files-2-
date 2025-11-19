# Database Schema
# LectureAI Database Documentation

**Database**: PostgreSQL 14+  
**ORM**: Prisma  
**Version**: 1.0

---

## Schema Overview

```
┌─────────────┐
│    users    │
└──────┬──────┘
       │ 1:N
       ▼
┌─────────────┐       ┌──────────────┐
│   videos    │◄──────┤   scripts    │
└──────┬──────┘  1:N  └──────────────┘
       │
       │ 1:N
       ▼
┌──────────────────┐
│  audio_files     │
└──────────────────┘

┌──────────────────┐
│  usage_stats     │
└──────────────────┘
       ▲
       │ N:1
       │
┌──────┴──────┐
│    users    │
└─────────────┘
```

---

## Tables

### users

Stores user account information (managed by Clerk, synced via webhook).

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  
  -- Subscription
  subscription_tier VARCHAR(20) DEFAULT 'free',
  subscription_status VARCHAR(20) DEFAULT 'active',
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_clerk_id ON users(clerk_user_id);
CREATE INDEX idx_users_email ON users(email);
```

**Plan Limits**:

| Tier | Videos/Month | Max Slides | Storage | Resolution |
|------|--------------|------------|---------|------------|
| free | 5 | 20 | 2GB | 720p |
| pro | 50 | 100 | 50GB | 1080p |
| business | 200 | Unlimited | 200GB | 4K |

---

### videos

Main table for video projects.

```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'uploaded',
  
  -- File References (S3 URLs)
  slides_file_url TEXT,
  video_file_url TEXT,
  thumbnail_url TEXT,
  
  -- Settings
  story_mode BOOLEAN DEFAULT false,
  story_template VARCHAR(50),
  voice_id VARCHAR(100),
  voice_speed FLOAT DEFAULT 1.0,
  background_music BOOLEAN DEFAULT false,
  
  -- Metadata
  duration_seconds INT,
  slide_count INT,
  file_size_bytes BIGINT,
  resolution VARCHAR(10),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);
```

**Status Values**:
- `uploaded`: File uploaded
- `parsing`: Extracting slides
- `script_pending`: Waiting for scripts
- `script_ready`: Scripts generated
- `voice_pending`: Waiting for voiceover
- `voice_ready`: Voiceovers generated
- `rendering`: Video being rendered
- `completed`: Video ready
- `failed`: Process failed

---

### scripts

Generated scripts for each slide.

```sql
CREATE TABLE scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  slide_number INT NOT NULL,
  
  -- Script Content
  content TEXT NOT NULL,
  word_count INT,
  estimated_duration INT, -- seconds
  
  -- Metadata
  edited BOOLEAN DEFAULT false,
  generated_with_ai BOOLEAN DEFAULT true,
  ai_cost DECIMAL(10, 6), -- USD
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_video_slide UNIQUE(video_id, slide_number)
);

CREATE INDEX idx_scripts_video_id ON scripts(video_id);
```

---

### audio_files

Generated voiceover audio files.

```sql
CREATE TABLE audio_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  slide_number INT NOT NULL,
  
  -- File Info
  audio_url TEXT NOT NULL, -- S3 URL
  duration_seconds FLOAT,
  file_size_bytes INT,
  
  -- Generation Settings
  voice_id VARCHAR(100),
  voice_speed FLOAT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_video_slide_audio UNIQUE(video_id, slide_number)
);

CREATE INDEX idx_audio_video_id ON audio_files(video_id);
```

---

### usage_stats

Track monthly usage per user.

```sql
CREATE TABLE usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month DATE NOT NULL, -- First day of month
  
  -- Video Usage
  videos_created INT DEFAULT 0,
  videos_completed INT DEFAULT 0,
  
  -- Storage (bytes)
  storage_used_bytes BIGINT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_user_month UNIQUE(user_id, month)
);

CREATE INDEX idx_usage_user_month ON usage_stats(user_id, month);
```

---

### brand_settings

Custom branding for Pro+ users.

```sql
CREATE TABLE brand_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- Logo
  logo_url TEXT,
  logo_position VARCHAR(20),
  
  -- Intro/Outro
  intro_video_url TEXT,
  outro_video_url TEXT,
  
  -- Colors
  color_primary VARCHAR(7), -- hex color
  color_secondary VARCHAR(7),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Prisma Schema

```prisma
// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id                     String    @id @default(uuid())
  clerkUserId            String    @unique @map("clerk_user_id")
  email                  String    @unique
  firstName              String?   @map("first_name")
  lastName               String?   @map("last_name")
  subscriptionTier       String    @default("free") @map("subscription_tier")
  subscriptionStatus     String    @default("active") @map("subscription_status")
  stripeCustomerId       String?   @map("stripe_customer_id")
  stripeSubscriptionId   String?   @map("stripe_subscription_id")
  createdAt              DateTime  @default(now()) @map("created_at")
  updatedAt              DateTime  @updatedAt @map("updated_at")

  videos         Video[]
  usageStats     UsageStats[]
  brandSettings  BrandSettings?

  @@map("users")
}

model Video {
  id                  String    @id @default(uuid())
  userId              String    @map("user_id")
  title               String
  status              String    @default("uploaded")
  slidesFileUrl       String?   @map("slides_file_url")
  videoFileUrl        String?   @map("video_file_url")
  thumbnailUrl        String?   @map("thumbnail_url")
  storyMode           Boolean   @default(false) @map("story_mode")
  storyTemplate       String?   @map("story_template")
  voiceId             String?   @map("voice_id")
  voiceSpeed          Float     @default(1.0) @map("voice_speed")
  backgroundMusic     Boolean   @default(false) @map("background_music")
  durationSeconds     Int?      @map("duration_seconds")
  slideCount          Int?      @map("slide_count")
  fileSizeBytes       BigInt?   @map("file_size_bytes")
  resolution          String?
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")
  completedAt         DateTime? @map("completed_at")

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  scripts      Script[]
  audioFiles   AudioFile[]

  @@index([userId])
  @@index([status])
  @@map("videos")
}

model Script {
  id                String    @id @default(uuid())
  videoId           String    @map("video_id")
  slideNumber       Int       @map("slide_number")
  content           String
  wordCount         Int?      @map("word_count")
  estimatedDuration Int?      @map("estimated_duration")
  edited            Boolean   @default(false)
  generatedWithAi   Boolean   @default(true) @map("generated_with_ai")
  aiCost            Decimal?  @map("ai_cost") @db.Decimal(10, 6)
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  video      Video       @relation(fields: [videoId], references: [id], onDelete: Cascade)

  @@unique([videoId, slideNumber])
  @@map("scripts")
}
```

---

## Common Queries

### Get User's Recent Videos

```sql
SELECT 
  id,
  title,
  status,
  thumbnail_url,
  duration_seconds,
  created_at
FROM videos
WHERE user_id = $1
  AND status != 'failed'
ORDER BY created_at DESC
LIMIT 20;
```

### Check Monthly Usage

```sql
SELECT 
  u.subscription_tier,
  us.videos_created,
  us.videos_completed,
  us.storage_used_bytes,
  CASE u.subscription_tier
    WHEN 'free' THEN 5
    WHEN 'pro' THEN 50
    WHEN 'business' THEN 200
  END as video_limit
FROM users u
LEFT JOIN usage_stats us ON us.user_id = u.id 
  AND us.month = DATE_TRUNC('month', CURRENT_DATE)
WHERE u.id = $1;
```

### Get Video with All Related Data

```sql
SELECT 
  v.*,
  json_agg(
    json_build_object(
      'slideNumber', s.slide_number,
      'content', s.content,
      'duration', s.estimated_duration
    ) ORDER BY s.slide_number
  ) as scripts
FROM videos v
LEFT JOIN scripts s ON s.video_id = v.id
WHERE v.id = $1
GROUP BY v.id;
```

---

## Migrations

### Running Migrations

```bash
# Create migration
npx prisma migrate dev --name add_story_mode

# Apply to production
npx prisma migrate deploy

# Generate client
npx prisma generate
```

---

**Schema Version**: 1.0  
**Last Updated**: November 19, 2025
