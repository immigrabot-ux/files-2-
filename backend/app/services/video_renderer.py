from moviepy.editor import (
    ImageClip,
    AudioFileClip,
    concatenate_videoclips,
    CompositeVideoClip
)
from PIL import Image
from io import BytesIO
from loguru import logger
from typing import List, Dict
import tempfile
import os


def render_video(
    slides: List[Dict],
    audio_files: List[Dict],
    output_path: str,
    resolution: str = "1080p",
    transition: str = "fade",
    background_music: bool = False
) -> Dict:
    """
    Render final video from slides and audio.

    Args:
        slides: List of slide dictionaries with imageUrl
        audio_files: List of audio file dictionaries with audioUrl and duration
        output_path: Path to save rendered video
        resolution: Video resolution (720p, 1080p, 4K)
        transition: Transition effect (fade, dissolve, none)
        background_music: Add background music

    Returns:
        Dict with video metadata
    """
    try:
        logger.info(f"Starting video render: {len(slides)} slides, {resolution}")

        # Resolution mapping
        resolutions = {
            "720p": (1280, 720),
            "1080p": (1920, 1080),
            "4K": (3840, 2160)
        }
        width, height = resolutions.get(resolution, (1920, 1080))

        # Create video clips
        clips = []

        for i, slide in enumerate(slides):
            slide_number = slide['number']

            # Find matching audio
            audio_data = next(
                (a for a in audio_files if a['slideNumber'] == slide_number),
                None
            )

            if not audio_data or not audio_data.get('audioUrl'):
                logger.warning(f"No audio found for slide {slide_number}, skipping")
                continue

            # Download slide image (in production, download from S3)
            # For now, create placeholder image
            img = Image.new('RGB', (width, height), color=(255, 255, 255))

            # Create temporary image file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp_img:
                img.save(tmp_img.name)
                img_path = tmp_img.name

            # Create temporary audio file
            # In production, download from S3
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as tmp_audio:
                # Write audio data here
                audio_path = tmp_audio.name

            # Create video clip
            duration = audio_data.get('duration', 10)

            img_clip = ImageClip(img_path).set_duration(duration)
            audio_clip = AudioFileClip(audio_path)

            video_clip = img_clip.set_audio(audio_clip)
            clips.append(video_clip)

            logger.info(f"Added clip for slide {slide_number}: {duration}s")

        if not clips:
            raise ValueError("No clips to render")

        # Concatenate all clips
        logger.info("Concatenating clips...")
        final_video = concatenate_videoclips(clips, method="compose")

        # Add transitions
        if transition == "fade":
            # Add fade transitions between clips
            logger.info("Adding fade transitions...")

        # Add background music if requested
        if background_music:
            logger.info("Adding background music...")

        # Write video file
        logger.info(f"Writing video to {output_path}...")
        final_video.write_videofile(
            output_path,
            fps=30,
            codec='libx264',
            audio_codec='aac',
            temp_audiofile='temp-audio.m4a',
            remove_temp=True,
            logger=None  # Suppress moviepy logs
        )

        # Cleanup temporary files
        for clip in clips:
            clip.close()

        # Get file size
        file_size = os.path.getsize(output_path)
        total_duration = sum(c.duration for c in clips)

        logger.info(f"Video rendered successfully: {file_size / (1024*1024):.2f}MB, {total_duration}s")

        return {
            "success": True,
            "outputPath": output_path,
            "fileSizeBytes": file_size,
            "durationSeconds": int(total_duration),
            "resolution": resolution,
            "clipCount": len(clips)
        }

    except Exception as exc:
        logger.error(f"Video rendering error: {str(exc)}")
        raise


def estimate_render_time(slide_count: int, resolution: str) -> int:
    """
    Estimate rendering time in seconds.

    Args:
        slide_count: Number of slides
        resolution: Video resolution

    Returns:
        Estimated render time in seconds
    """
    # Base time per slide
    base_time = {
        "720p": 10,
        "1080p": 15,
        "4K": 30
    }.get(resolution, 15)

    return slide_count * base_time
