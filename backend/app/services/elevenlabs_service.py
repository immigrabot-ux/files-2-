from elevenlabs import generate, voices, Voice
from app.config import settings
from loguru import logger
from typing import List, Dict
import os


def generate_voiceover(
    text: str,
    voice_id: str = "rachel",
    speed: float = 1.0
) -> bytes:
    """
    Generate voiceover audio from text using ElevenLabs.

    Args:
        text: Script text to convert to speech
        voice_id: ElevenLabs voice ID
        speed: Speech speed (0.5 to 2.0)

    Returns:
        Audio data in bytes (MP3 format)
    """
    try:
        os.environ["ELEVENLABS_API_KEY"] = settings.elevenlabs_api_key

        audio = generate(
            text=text,
            voice=voice_id,
            model="eleven_multilingual_v2"
        )

        logger.info(f"Generated voiceover: {len(text)} characters")

        return audio

    except Exception as exc:
        logger.error(f"ElevenLabs API error: {str(exc)}")
        raise


def get_available_voices() -> List[Dict[str, str]]:
    """
    Get list of available voices from ElevenLabs.

    Returns:
        List of voice dictionaries with id, name, and metadata
    """
    try:
        os.environ["ELEVENLABS_API_KEY"] = settings.elevenlabs_api_key

        available_voices = voices()

        voice_list = []
        for voice in available_voices:
            voice_list.append({
                "id": voice.voice_id,
                "name": voice.name,
                "category": voice.category if hasattr(voice, 'category') else "general",
                "description": voice.description if hasattr(voice, 'description') else ""
            })

        return voice_list

    except Exception as exc:
        logger.error(f"ElevenLabs API error: {str(exc)}")
        raise


def estimate_cost(character_count: int) -> float:
    """
    Estimate ElevenLabs API cost for voiceover generation.

    Args:
        character_count: Number of characters in script

    Returns:
        Estimated cost in USD
    """
    # ElevenLabs pricing: ~$0.30 per 1K characters (varies by plan)
    cost = (character_count / 1000) * 0.30
    return round(cost, 6)
