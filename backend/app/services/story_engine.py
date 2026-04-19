from app.prompts.writer_prompts import (
    build_raw_story_instructions,
    build_raw_story_prompt,
)
from app.services.llm_client import get_openai_model, request_text_output


def generate_first_chapter_raw_text(
    *,
    universe: str,
    protagonist: str,
    theme: str,
    genre: str,
    tone: str,
) -> str:
    return request_text_output(
        model=get_openai_model(),
        instructions=build_raw_story_instructions(),
        user_input=build_raw_story_prompt(
            universe=universe,
            protagonist=protagonist,
            theme=theme,
            genre=genre,
            tone=tone,
        ),
    )
