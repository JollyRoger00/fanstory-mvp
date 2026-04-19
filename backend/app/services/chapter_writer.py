from dataclasses import dataclass

from pydantic import BaseModel, ConfigDict, Field

from app.domain.models import Chapter, Choice, StoryBible, StoryConfig, StoryState
from app.prompts.writer_prompts import build_writer_instructions, build_writer_prompt
from app.services.chapter_planner import ChapterPlan
from app.services.llm_client import request_structured_output


@dataclass
class ChapterWritingInput:
    config: StoryConfig
    bible: StoryBible
    current_state: StoryState
    short_history_summary: str
    plan: ChapterPlan
    last_chapter: Chapter | None = None
    selected_choice: Choice | None = None


class ChapterWriterResult(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    chapter_title: str = Field(min_length=1)
    chapter_text: str = Field(min_length=1)
    choices: list[str] = Field(min_length=3, max_length=4)
    state_summary: str = Field(min_length=1)


def write_chapter_from_plan(writing_input: ChapterWritingInput) -> ChapterWriterResult:
    return request_structured_output(
        instructions=build_writer_instructions(),
        user_input=build_writer_prompt(
            config=writing_input.config,
            bible=writing_input.bible,
            current_state=writing_input.current_state,
            short_history_summary=writing_input.short_history_summary,
            last_chapter=writing_input.last_chapter,
            selected_choice=writing_input.selected_choice,
            plan=writing_input.plan,
        ),
        response_model=ChapterWriterResult,
    )
