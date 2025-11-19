from celery import shared_task
from app.services.slide_parser import parse_slides
from app.services.s3_service import download_file, upload_file
from loguru import logger
from typing import Dict, List
import json


@shared_task(bind=True, max_retries=3)
def parse_slides_task(self, video_id: str, file_url: str, file_type: str) -> Dict:
    """
    Celery task to parse slides from uploaded file.

    Args:
        video_id: Video ID
        file_url: S3 URL of uploaded file
        file_type: File extension (.pptx, .pdf, .key)

    Returns:
        Dict with parsed slides data
    """
    try:
        logger.info(f"Starting slide parsing for video {video_id}")

        # Download file from S3
        file_data = download_file(file_url)

        # Parse slides
        slides = parse_slides(file_data, file_type)

        # Upload slide images to S3
        for slide in slides:
            if slide.get('imageData'):
                image_url = upload_file(
                    slide['imageData'],
                    f"{video_id}_slide_{slide['number']}.png",
                    folder="slides"
                )
                slide['imageUrl'] = image_url
                del slide['imageData']  # Remove binary data

        logger.info(f"Parsed {len(slides)} slides for video {video_id}")

        return {
            "success": True,
            "videoId": video_id,
            "slideCount": len(slides),
            "slides": slides
        }

    except Exception as exc:
        logger.error(f"Parse slides task failed: {str(exc)}")
        raise self.retry(exc=exc, countdown=60)
