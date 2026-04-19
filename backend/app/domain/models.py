from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class StoryConfig(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    story_id: str = Field(min_length=1)
    universe: str = Field(min_length=1)
    protagonist: str = Field(min_length=1)
    theme: str = Field(min_length=1)
    genre: str = Field(min_length=1)
    tone: str = Field(min_length=1)
    created_at: datetime


class StoryBible(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    world_summary: str = Field(min_length=1)
    protagonist_summary: str = Field(min_length=1)
    tone_summary: str = Field(min_length=1)
    continuity_rules: list[str] = Field(default_factory=list)


class StoryState(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    chapter_number: int = Field(ge=1)
    current_state_summary: str = Field(min_length=1)
    active_goals: list[str] = Field(default_factory=list)
    unresolved_tensions: list[str] = Field(default_factory=list)
    known_facts: list[str] = Field(default_factory=list)


class Choice(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    choice_id: str = Field(min_length=1)
    label: str = Field(min_length=1)


class ChoiceResolution(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    choice_id: str = Field(min_length=1)
    chapter_number: int = Field(ge=1)
    resolution_summary: str = Field(min_length=1)


class Chapter(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    chapter_id: str = Field(min_length=1)
    chapter_number: int = Field(ge=1)
    title: str = Field(min_length=1)
    text: str = Field(min_length=1)
    state_summary_after_chapter: str = Field(min_length=1)
    choices: list[Choice] = Field(default_factory=list)


class StoryAggregate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    story_id: str
    config: StoryConfig
    bible: StoryBible
    state: StoryState
    chapters: list[Chapter] = Field(default_factory=list)
    available_choices: list[Choice] = Field(default_factory=list)
    choice_history: list[ChoiceResolution] = Field(default_factory=list)
