from celery import shared_task
from app.services.openai_service import generate_script, estimate_cost
from loguru import logger
from typing import Dict, Optional


@shared_task(bind=True, max_retries=3)
def generate_script_task(
    self,
    video_id: str,
    slides: list,
    story_mode: bool = False,
    story_template: Optional[str] = None,
    intensity: str = "medium",
    target_audience: str = "college students"
) -> Dict:
    """
    Celery task to generate scripts for all slides.

    Args:
        video_id: Video ID
        slides: List of slide dictionaries
        story_mode: Enable storytelling mode
        story_template: Story template type
        intensity: Story intensity level
        target_audience: Target audience description

    Returns:
        Dict with generated scripts
    """
    try:
        logger.info(f"Starting script generation for video {video_id}")
        logger.info(f"Story mode: {story_mode}, Template: {story_template}, Intensity: {intensity}")

        scripts = []
        total_cost = 0.0

        for slide in slides:
            try:
                # Generate script for this slide
                script_content = generate_script(
                    slide_text=slide['text'],
                    speaker_notes=slide.get('speakerNotes'),
                    story_mode=story_mode,
                    story_template=story_template,
                    intensity=intensity,
                    target_audience=target_audience
                )

                # Calculate metrics
                word_count = len(script_content.split())
                estimated_duration = int(word_count / 2.5)  # ~150 words per minute / 60 seconds
                ai_cost = estimate_cost(word_count)
                total_cost += ai_cost

                scripts.append({
                    "slideNumber": slide['number'],
                    "content": script_content,
                    "wordCount": word_count,
                    "estimatedDuration": estimated_duration,
                    "edited": False,
                    "generatedWithAi": True,
                    "aiCost": ai_cost
                })

                logger.info(f"Generated script for slide {slide['number']}: {word_count} words")

            except Exception as exc:
                logger.error(f"Failed to generate script for slide {slide['number']}: {str(exc)}")
                # Continue with next slide instead of failing entire job
                scripts.append({
                    "slideNumber": slide['number'],
                    "content": f"Error generating script: {str(exc)}",
                    "wordCount": 0,
                    "estimatedDuration": 0,
                    "edited": False,
                    "generatedWithAi": False,
                    "aiCost": 0
                })

        total_duration = sum(s['estimatedDuration'] for s in scripts)

        logger.info(f"Generated {len(scripts)} scripts for video {video_id}")
        logger.info(f"Total duration: {total_duration}s, Total cost: ${total_cost:.4f}")

        return {
            "success": True,
            "videoId": video_id,
            "scripts": scripts,
            "totalDuration": total_duration,
            "costEstimate": round(total_cost, 4)
        }

    except Exception as exc:
        logger.error(f"Generate script task failed: {str(exc)}")
        raise self.retry(exc=exc, countdown=60)
