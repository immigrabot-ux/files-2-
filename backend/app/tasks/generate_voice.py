from celery import shared_task
from app.services.elevenlabs_service import generate_voiceover, estimate_cost
from app.services.s3_service import upload_file
from loguru import logger
from typing import Dict
import uuid


@shared_task(bind=True, max_retries=3)
def generate_voice_task(
    self,
    video_id: str,
    scripts: list,
    voice_id: str = "rachel",
    speed: float = 1.0
) -> Dict:
    """
    Celery task to generate voiceovers for all scripts.

    Args:
        video_id: Video ID
        scripts: List of script dictionaries
        voice_id: ElevenLabs voice ID
        speed: Speech speed (0.5 to 2.0)

    Returns:
        Dict with generated audio files
    """
    try:
        logger.info(f"Starting voice generation for video {video_id}")
        logger.info(f"Voice: {voice_id}, Speed: {speed}, Scripts: {len(scripts)}")

        audio_files = []
        total_cost = 0.0
        total_duration = 0.0

        for script in scripts:
            try:
                # Generate voiceover
                audio_data = generate_voiceover(
                    text=script['content'],
                    voice_id=voice_id,
                    speed=speed
                )

                # Upload to S3
                file_name = f"{video_id}_slide_{script['slideNumber']}.mp3"
                audio_url = upload_file(
                    audio_data,
                    file_name,
                    folder="audio",
                    content_type="audio/mpeg"
                )

                # Calculate metrics
                character_count = len(script['content'])
                duration = script.get('estimatedDuration', 60)  # Fallback to 60s
                ai_cost = estimate_cost(character_count)
                total_cost += ai_cost
                total_duration += duration

                audio_files.append({
                    "slideNumber": script['slideNumber'],
                    "audioUrl": audio_url,
                    "duration": duration,
                    "fileSizeBytes": len(audio_data),
                    "voiceId": voice_id,
                    "voiceSpeed": speed
                })

                logger.info(f"Generated voiceover for slide {script['slideNumber']}: {duration}s")

            except Exception as exc:
                logger.error(f"Failed to generate voiceover for slide {script['slideNumber']}: {str(exc)}")
                # Continue with next slide instead of failing entire job
                audio_files.append({
                    "slideNumber": script['slideNumber'],
                    "audioUrl": None,
                    "duration": 0,
                    "fileSizeBytes": 0,
                    "voiceId": voice_id,
                    "voiceSpeed": speed,
                    "error": str(exc)
                })

        logger.info(f"Generated {len(audio_files)} voiceovers for video {video_id}")
        logger.info(f"Total duration: {total_duration}s, Total cost: ${total_cost:.4f}")

        return {
            "success": True,
            "videoId": video_id,
            "audioFiles": audio_files,
            "totalDuration": int(total_duration),
            "costEstimate": round(total_cost, 4)
        }

    except Exception as exc:
        logger.error(f"Generate voice task failed: {str(exc)}")
        raise self.retry(exc=exc, countdown=60)
