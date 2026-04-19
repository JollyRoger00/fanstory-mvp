from dataclasses import dataclass

from pydantic import BaseModel, ConfigDict, Field

from app.domain.models import Chapter, Choice, StoryBible, StoryConfig, StoryState
from app.prompts.planner_prompts import (
    build_planner_instructions,
    build_planner_prompt,
)
from app.services.llm_client import request_structured_output


@dataclass
class ChapterPlanningInput:
    config: StoryConfig
    bible: StoryBible
    current_state: StoryState
    short_history_summary: str
    last_chapter: Chapter | None = None
    selected_choice: Choice | None = None
    expected_target_chapter_number: int = 1


class ChapterPlan(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    target_chapter_number: int = Field(ge=1)
    scene_goal: str = Field(min_length=1)
    main_conflict: str = Field(min_length=1)
    beat_outline: list[str] = Field(min_length=1)
    continuity_constraints: list[str] = Field(min_length=1)
    expected_state_delta: str = Field(min_length=1)
    candidate_choices: list[str] = Field(min_length=3, max_length=4)


def plan_next_chapter(planning_input: ChapterPlanningInput) -> ChapterPlan:
    return request_structured_output(
        instructions=build_planner_instructions(),
        user_input=build_planner_prompt(
            config=planning_input.config,
            bible=planning_input.bible,
            current_state=planning_input.current_state,
            short_history_summary=planning_input.short_history_summary,
            last_chapter=planning_input.last_chapter,
            selected_choice=planning_input.selected_choice,
            expected_target_chapter_number=planning_input.expected_target_chapter_number,
        ),
        response_model=ChapterPlan,
    )
