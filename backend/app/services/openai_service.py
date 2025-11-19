from openai import OpenAI
from app.config import settings
from loguru import logger
from typing import Optional

client = OpenAI(api_key=settings.openai_api_key)


def generate_script(
    slide_text: str,
    speaker_notes: Optional[str] = None,
    story_mode: bool = False,
    story_template: Optional[str] = None,
    intensity: str = "medium",
    target_audience: str = "college students"
) -> str:
    """
    Generate lecture script from slide content using OpenAI GPT-4o.

    Args:
        slide_text: Text extracted from slide
        speaker_notes: Optional speaker notes
        story_mode: Enable storytelling mode
        story_template: One of: journey, problem-solution, timeline, debate, mystery
        intensity: low, medium, or high
        target_audience: Target audience description

    Returns:
        Generated script text (150-225 words)
    """
    try:
        if story_mode and story_template:
            prompt = _build_story_mode_prompt(
                slide_text, speaker_notes, story_template, intensity, target_audience
            )
        else:
            prompt = _build_normal_mode_prompt(slide_text, speaker_notes, target_audience)

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert educational content writer who creates engaging, natural-sounding lecture scripts."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=400
        )

        script = response.choices[0].message.content.strip()
        logger.info(f"Generated script: {len(script)} characters")

        return script

    except Exception as exc:
        logger.error(f"OpenAI API error: {str(exc)}")
        raise


def _build_normal_mode_prompt(
    slide_text: str,
    speaker_notes: Optional[str],
    target_audience: str
) -> str:
    """Build prompt for normal mode script generation"""
    notes_section = f"\n\nSPEAKER NOTES:\n{speaker_notes}" if speaker_notes else ""

    return f"""Create a natural, conversational lecture script from this slide content.

SLIDE TEXT:
{slide_text}{notes_section}

TARGET AUDIENCE: {target_audience}

REQUIREMENTS:
- Write 150-225 words (60-90 seconds when spoken)
- Use conversational, engaging language
- Explain concepts clearly
- Maintain educational accuracy
- Sound natural when read aloud
- Do not use phrases like "In this slide" or "As you can see"

Write the script:"""


def _build_story_mode_prompt(
    slide_text: str,
    speaker_notes: Optional[str],
    template: str,
    intensity: str,
    target_audience: str
) -> str:
    """Build prompt for story mode script generation"""
    notes_section = f"\n\nSPEAKER NOTES:\n{speaker_notes}" if speaker_notes else ""

    template_instructions = {
        "journey": "Transform this into a journey narrative. Follow a character or entity through the concept as if traveling or exploring.",
        "problem-solution": "Transform this into a problem-solution narrative. Present a compelling challenge first, then reveal the solution dramatically.",
        "timeline": "Transform this into a historical timeline narrative. Take the audience through time as if time-traveling to witness events unfold.",
        "debate": "Transform this into a debate narrative. Present multiple viewpoints or theories as if witnessing a dramatic disagreement.",
        "mystery": "Transform this into a mystery narrative. Reveal information gradually with suspense and curiosity."
    }

    intensity_instructions = {
        "low": "Use subtle storytelling (80% educational, 20% story). Add 'Imagine' and 'Consider' phrases, basic analogies.",
        "medium": "Use balanced narrative (60% educational, 40% story). Include character references, vivid descriptions, engaging hooks.",
        "high": "Use full storytelling (50% educational, 50% story). Add dramatic language, detailed scenes, and strong emotions."
    }

    return f"""Transform this educational content into an engaging narrative using storytelling techniques.

SLIDE TEXT:
{slide_text}{notes_section}

STORY TEMPLATE: {template}
{template_instructions.get(template, "")}

INTENSITY LEVEL: {intensity}
{intensity_instructions.get(intensity, "")}

TARGET AUDIENCE: {target_audience}

REQUIREMENTS:
- Write 150-225 words (60-90 seconds when spoken)
- Transform content into the specified story template
- Maintain 100% educational accuracy
- Make it engaging and memorable
- Sound natural when read aloud
- Match the specified intensity level

Write the story-enhanced script:"""


def estimate_cost(word_count: int) -> float:
    """
    Estimate OpenAI API cost for script generation.

    Args:
        word_count: Number of words in input

    Returns:
        Estimated cost in USD
    """
    # GPT-4o pricing: ~$0.01 per 1K tokens
    # Rough estimate: 1 word ≈ 1.3 tokens
    tokens = int(word_count * 1.3)
    cost = (tokens / 1000) * 0.01
    return round(cost, 6)
