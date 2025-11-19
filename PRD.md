# Product Requirements Document (PRD)
# LectureAI v1.0

**Last Updated**: November 19, 2025
**Document Owner**: Product Team
**Status**: Approved for Development

---

## 1. Executive Summary

### 1.1 Product Overview
LectureAI is a SaaS platform that converts educational slide decks (PowerPoint, PDF) into professional lecture videos with AI-generated voiceovers and optional storytelling enhancements.

### 1.2 Target Market
- Online course creators (Udemy, Teachable, Thinkific)
- University professors teaching online
- Corporate trainers
- K-12 teachers creating flipped classroom content

### 1.3 Business Objectives
- Capture 1% of course creator market (1,750 users) in Year 1
- Achieve $60K MRR by Month 12
- Maintain 40%+ gross margin
- NPS score > 50

### 1.4 Success Criteria
- User can generate video in < 5 minutes
- Script quality rated 4.5+/5 by users
- 30%+ free-to-paid conversion rate
- < 5% monthly churn

---

## 2. User Personas

### Persona 1: Sarah - Online Course Creator
**Demographics**
- Age: 32
- Location: United States
- Occupation: Full-time course creator (Udemy + Teachable)
- Income: $80K/year from courses

**Goals**
- Create 3-5 courses per year
- Scale content production without hiring
- Maintain professional quality
- Increase course completion rates

**Pain Points**
- Spends 8+ hours per video recording and editing
- Camera-shy, uncomfortable on camera
- Editing software is complicated
- Re-recording when mistakes happen wastes time

**Technical Proficiency**: Medium
**Budget**: $50-100/month for tools
**Current Tools**: Camtasia, Loom, Canva

**Quote**: "I spend more time editing videos than creating content. There has to be a faster way."

### Persona 2: Prof. James - University Lecturer
**Demographics**
- Age: 48
- Location: United Kingdom
- Occupation: Economics professor
- Institution: Mid-sized university

**Goals**
- Flip classroom with pre-recorded lectures
- Improve student engagement
- Save time for research
- Make lectures accessible

**Pain Points**
- PowerPoint dumps are boring
- No video production skills
- University doesn't provide support
- Students skip long, dry videos

**Technical Proficiency**: Low
**Budget**: Department budget available
**Current Tools**: PowerPoint, Zoom recordings

**Quote**: "My PowerPoints are great, but students need something more engaging than me reading slides."

### Persona 3: Mike - Corporate Trainer
**Demographics**
- Age: 41
- Location: Canada
- Occupation: L&D Manager at Fortune 500
- Team Size: 3 trainers

**Goals**
- Create scalable training modules
- Reduce external vendor costs
- Update content quickly
- Track completion metrics

**Pain Points**
- Vendor videos cost $5K+ each
- Hard to update outdated content
- Need consistent branding
- Compliance training is boring

**Technical Proficiency**: High
**Budget**: $500/month for tools
**Current Tools**: Articulate, Camtasia, internal LMS

**Quote**: "We need to produce 100+ training videos per quarter. Vendors are too expensive and slow."

---

## 3. Product Features

### 3.1 Feature Priority Matrix

| Feature | Priority | Phase | Effort | Impact |
|---------|----------|-------|--------|--------|
| Slide upload (PPT/PDF) | P0 | MVP | M | High |
| Script generation | P0 | MVP | M | High |
| AI voiceover | P0 | MVP | H | High |
| Video rendering | P0 | MVP | H | High |
| Story Mode | P0 | MVP | M | High |
| User authentication | P0 | MVP | L | Medium |
| Subscription payments | P0 | MVP | M | High |
| Dashboard | P0 | MVP | M | Medium |
| Script editing | P1 | MVP | L | High |
| Voice selection | P1 | MVP | L | Medium |
| Custom branding | P1 | Phase 2 | M | Medium |
| Visual annotations | P2 | Phase 2 | H | Medium |
| Team collaboration | P2 | Phase 2 | H | Low |
| LMS integrations | P2 | Phase 2 | H | Medium |
| API access | P3 | Phase 3 | M | Low |

---

## 4. MVP Feature Specifications

### 4.1 Slide Upload

**Description**: Users upload PowerPoint or PDF files to extract content and create videos.

**Requirements**
- Support .pptx, .pdf, .key formats
- Maximum file size: 100MB
- Maximum slides: 100 per upload
- Drag-and-drop interface
- File validation before upload
- Extract text content from slides
- Extract speaker notes if available
- Generate thumbnail for each slide

**User Flow**
1. User clicks "Create New Video"
2. Drag file or click to browse
3. System validates file (format, size)
4. Upload progress bar shown
5. Processing status displayed
6. Slide previews generated
7. User proceeds to next step

**Technical Constraints**
- Parse complex PowerPoint layouts
- Handle images embedded in slides
- Support multiple languages
- Process in < 30 seconds

**Acceptance Criteria**
- ✅ All three formats supported
- ✅ Error messages for invalid files
- ✅ Preview shows all slides
- ✅ Text extraction 95%+ accurate
- ✅ Speaker notes preserved

### 4.2 AI Script Generation

**Description**: Automatically generate lecture scripts from slide content using OpenAI GPT-4o.

**Requirements**
- Generate natural, conversational scripts
- 150-200 words per slide (60-90 seconds)
- Use slide text and speaker notes as input
- Option for "Normal Mode" or "Story Mode"
- User can edit generated scripts
- Regenerate individual slides
- Save custom edits

**Story Mode Enhancement**
- Transforms dry content into narratives
- Adds hooks and engaging language
- Uses analogies and examples
- Maintains educational accuracy
- 3 intensity levels (Low, Medium, High)
- 5 story templates (Journey, Problem-Solution, etc.)

**Technical Constraints**
- API rate limits (60 requests/min)
- Cost per slide: ~$0.02-0.09
- Processing time: 2-3 seconds per slide
- Handle API failures gracefully

**Acceptance Criteria**
- ✅ Scripts sound natural when read
- ✅ Story Mode noticeably different from Normal
- ✅ User can edit and save changes
- ✅ Regenerate works without affecting other slides
- ✅ Cost stays under $0.10 per slide

### 4.3 Story Mode

**Description**: Transform educational content into engaging narratives using AI storytelling techniques.

**Story Templates**

**1. Journey Template**
- Follow a character/entity through the concept
- Example: "Follow a photon as it travels through photosynthesis"
- Best for: Processes, systems, cause-and-effect

**2. Problem-Solution Template**
- Present challenge, then reveal solution
- Example: "Ancient civilizations faced food storage issues. Then came..."
- Best for: Inventions, historical events, solutions

**3. Historical Timeline Template**
- Time-travel narrative through events
- Example: "Let's rewind to 1776 when..."
- Best for: History, evolution of ideas

**4. Debate Template**
- Present multiple viewpoints dramatically
- Example: "Scientists disagreed: Is light a wave or particle?"
- Best for: Controversies, theories, perspectives

**5. Mystery Template**
- Reveal information gradually with suspense
- Example: "A strange pattern emerged in the data..."
- Best for: Discoveries, investigations, phenomena

**Intensity Levels**

**Low**: Subtle storytelling
- Adds "Imagine" and "Consider"
- Basic analogies
- Conversational tone
- 80% educational, 20% story

**Medium**: Balanced narrative
- Character references
- Vivid descriptions
- Engaging hooks
- 60% educational, 40% story

**High**: Full storytelling mode
- Dramatic language
- Detailed scenes
- Strong emotions
- 50% educational, 50% story

**Acceptance Criteria**
- ✅ Story scripts noticeably different from normal
- ✅ Educational content remains accurate
- ✅ Templates produce appropriate narratives
- ✅ Intensity levels have clear differences
- ✅ Works across subject matters
- ✅ Students rate engagement 4+/5

---

## 5. User Stories

### Epic 1: Core Video Generation

**USER-101**: Upload Slides
```
AS A course creator
I WANT TO upload my PowerPoint or PDF slides
SO THAT I can turn them into a video

ACCEPTANCE CRITERIA:
✅ Given I am on the create page
   When I drag and drop a .pptx file
   Then it uploads and shows all slides

✅ Given I upload an invalid file
   When the system validates it
   Then I see a clear error message
```

**USER-102**: Generate Script (Normal Mode)
```
AS A course creator
I WANT TO auto-generate scripts from my slides
SO THAT I don't have to write everything manually

ACCEPTANCE CRITERIA:
✅ Given I have uploaded slides
   When I click "Generate Script"
   Then AI creates natural scripts for each slide
```

**USER-103**: Generate Script (Story Mode)
```
AS A teacher
I WANT TO convert my content into stories
SO THAT my students stay engaged

ACCEPTANCE CRITERIA:
✅ Given I toggle Story Mode ON
   When I select a story template
   Then scripts are transformed into narratives
```

**USER-104**: Generate AI Voiceover
```
AS A course creator
I WANT TO generate professional voiceovers
SO THAT I don't have to record my own voice

ACCEPTANCE CRITERIA:
✅ Given I have confirmed scripts
   When I select a voice
   Then I can preview it
```

**USER-105**: Render Final Video
```
AS A course creator
I WANT TO combine everything into a video
SO THAT I can download and use it

ACCEPTANCE CRITERIA:
✅ Given I have slides and audio ready
   When I click "Render Video"
   Then job is queued with progress tracking
```

---

## 6. Technical Requirements

### 6.1 Performance
- Video generation: < 5 minutes for 10 slides
- Page load time: < 2 seconds
- API response time: < 500ms (p95)
- Concurrent users: 100+ without degradation

### 6.2 Scalability
- Support 10,000+ users
- Render 1,000+ videos per day
- Auto-scaling workers
- Database read replicas

### 6.3 Security
- HTTPS everywhere
- Encrypted data at rest
- API rate limiting
- SQL injection prevention
- XSS prevention
- CSRF protection

### 6.4 Reliability
- 99.5% uptime SLA
- Database backups daily
- Error monitoring (Sentry)
- Logging (CloudWatch)

---

## 7. Pricing

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

---

## 8. Success Metrics

**Month 1**: 100 signups, 50 videos, 10 paying customers
**Month 3**: 500 signups, 500 videos, 50 paying ($1,450 MRR)
**Month 6**: 2,000 signups, 3,000 videos, 200 paying ($5,800 MRR)

---

**Document Version**: 1.0
**Last Review**: November 19, 2025
**Next Review**: December 19, 2025
