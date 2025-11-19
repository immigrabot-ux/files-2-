# API Reference
# LectureAI REST API Documentation

**Version**: 1.0  
**Base URL**: `https://api.lectureai.com` (Production)  
**Base URL**: `http://localhost:3000` (Development)

---

## Authentication

All API requests require authentication via Clerk JWT tokens.

**Headers Required**:
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## Upload Endpoints

### POST /api/upload

Upload slide deck for video creation.

**Request**:
```http
POST /api/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <binary>
```

**Supported Formats**: `.pptx`, `.pdf`, `.key`
**Max file size**: 100MB
**Max slides**: 100

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "videoId": "550e8400-e29b-41d4-a716-446655440000",
    "fileUrl": "https://s3.amazonaws.com/...",
    "slideCount": 15,
    "slides": [
      {
        "number": 1,
        "imageUrl": "https://s3.amazonaws.com/...",
        "text": "Introduction to Machine Learning",
        "speakerNotes": "Start with definition..."
      }
    ]
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "Only .pptx, .pdf, and .key files are supported"
  }
}
```

---

## Script Generation

### POST /api/generate/script

Generate lecture scripts from slide content.

**Request**:
```json
{
  "videoId": "550e8400-e29b-41d4-a716-446655440000",
  "storyMode": false,
  "storyTemplate": "journey",
  "intensity": "medium",
  "targetAudience": "college students"
}
```

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `videoId` | string (UUID) | Yes | Video ID from upload |
| `storyMode` | boolean | No | Enable storytelling (default: false) |
| `storyTemplate` | string | No* | One of: journey, problem-solution, timeline, debate, mystery |
| `intensity` | string | No | One of: low, medium, high (default: medium) |

*Required if `storyMode` is true

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "videoId": "550e8400-e29b-41d4-a716-446655440000",
    "scripts": [
      {
        "slideNumber": 1,
        "content": "Welcome to our exploration of machine learning...",
        "wordCount": 187,
        "estimatedDuration": 65,
        "edited": false
      }
    ],
    "totalDuration": 1200,
    "costEstimate": 0.15
  }
}
```

---

## Voice Generation

### GET /api/voices

List available voices.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "voices": [
      {
        "id": "rachel",
        "name": "Rachel",
        "gender": "female",
        "accent": "US",
        "tone": "professional",
        "sampleUrl": "https://s3.amazonaws.com/samples/rachel.mp3"
      }
    ]
  }
}
```

### POST /api/generate/voice

Generate voiceovers for all scripts.

**Request**:
```json
{
  "videoId": "550e8400-e29b-41d4-a716-446655440000",
  "voiceId": "rachel",
  "speed": 1.0
}
```

**Response** (202 Accepted):
```json
{
  "success": true,
  "data": {
    "jobId": "660f9500-f39c-52e5-b827-557766551111",
    "status": "queued",
    "estimatedTime": 180
  }
}
```

### GET /api/generate/voice/status/:jobId

Check voice generation status.

**Response** (200 OK - Complete):
```json
{
  "success": true,
  "data": {
    "jobId": "660f9500-f39c-52e5-b827-557766551111",
    "status": "completed",
    "progress": 100,
    "audioFiles": [
      {
        "slideNumber": 1,
        "audioUrl": "https://s3.amazonaws.com/...",
        "duration": 65
      }
    ]
  }
}
```

---

## Video Management

### POST /api/videos/render

Render final video.

**Request**:
```json
{
  "videoId": "550e8400-e29b-41d4-a716-446655440000",
  "settings": {
    "resolution": "1080p",
    "transition": "fade",
    "backgroundMusic": true
  }
}
```

**Response** (202 Accepted):
```json
{
  "success": true,
  "data": {
    "renderJobId": "770g0611-g40d-63f6-c938-668877662222",
    "status": "queued",
    "estimatedTime": 300
  }
}
```

### GET /api/videos

List user's videos.

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search by title
- `status`: Filter by status

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "videos": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Introduction to Machine Learning",
        "thumbnailUrl": "https://s3.amazonaws.com/...",
        "status": "completed",
        "duration": 1245,
        "createdAt": "2025-11-18T15:30:00Z"
      }
    ],
    "pagination": {
      "total": 47,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  }
}
```

### GET /api/videos/:id

Get single video details.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Introduction to Machine Learning",
    "status": "completed",
    "videoUrl": "https://s3.amazonaws.com/...",
    "duration": 1245,
    "slideCount": 15,
    "createdAt": "2025-11-18T15:30:00Z"
  }
}
```

### DELETE /api/videos/:id

Delete a video.

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Video deleted successfully"
}
```

---

## User & Usage

### GET /api/user/usage

Get current usage statistics.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "currentPlan": "pro",
    "videos": {
      "used": 23,
      "limit": 50,
      "percentage": 46
    },
    "storage": {
      "used": 12884901888,
      "limit": 53687091200,
      "usedFormatted": "12.0 GB",
      "limitFormatted": "50 GB"
    }
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_FILE_TYPE` | Unsupported file format |
| `FILE_TOO_LARGE` | File exceeds size limit |
| `VIDEO_NOT_FOUND` | Video ID doesn't exist |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `QUOTA_EXCEEDED` | Monthly video limit reached |
| `PAYMENT_REQUIRED` | Upgrade needed for feature |

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/upload` | 10 requests | 10 minutes |
| `/api/generate/script` | 20 requests | 1 hour |
| `/api/videos/render` | 5 requests | 10 minutes |
| All others | 100 requests | 1 minute |

---

**API Version**: 1.0  
**Last Updated**: November 19, 2025
