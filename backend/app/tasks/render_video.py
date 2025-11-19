from celery import shared_task
from app.services.video_renderer import render_video, estimate_render_time
from app.services.s3_service import upload_file, download_file
from loguru import logger
from typing import Dict
import tempfile
import os


@shared_task(bind=True, max_retries=3)
def render_video_task(
    self,
    video_id: str,
    slides: list,
    audio_files: list,
    settings: dict
) -> Dict:
    """
    Celery task to render final video.

    Args:
        video_id: Video ID
        slides: List of slide dictionaries
        audio_files: List of audio file dictionaries
        settings: Rendering settings (resolution, transition, etc.)

    Returns:
        Dict with rendered video data
    """
    try:
        logger.info(f"Starting video rendering for {video_id}")

        resolution = settings.get('resolution', '1080p')
        transition = settings.get('transition', 'fade')
        background_music = settings.get('backgroundMusic', False)

        # Estimate render time
        estimated_time = estimate_render_time(len(slides), resolution)
        logger.info(f"Estimated render time: {estimated_time}s")

        # Create temporary output file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as tmp:
            output_path = tmp.name

        # Render video
        result = render_video(
            slides=slides,
            audio_files=audio_files,
            output_path=output_path,
            resolution=resolution,
            transition=transition,
            background_music=background_music
        )

        # Upload to S3
        with open(output_path, 'rb') as f:
            video_data = f.read()

        video_url = upload_file(
            video_data,
            f"{video_id}.mp4",
            folder="videos",
            content_type="video/mp4"
        )

        # Cleanup
        os.unlink(output_path)

        logger.info(f"Video rendered and uploaded: {video_url}")

        return {
            "success": True,
            "videoId": video_id,
            "videoUrl": video_url,
            "fileSizeBytes": result['fileSizeBytes'],
            "durationSeconds": result['durationSeconds'],
            "resolution": resolution
        }

    except Exception as exc:
        logger.error(f"Render video task failed: {str(exc)}")
        raise self.retry(exc=exc, countdown=120)
