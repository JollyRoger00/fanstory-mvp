from pydantic import BaseModel, ConfigDict, Field

from app.domain.models import StoryAggregate


class StoryCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    universe: str = Field(min_length=1)
    protagonist: str = Field(min_length=1)
    theme: str = Field(min_length=1)
    genre: str = Field(min_length=1)
    tone: str = Field(min_length=1)


class StoryChooseRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    choice_id: str = Field(min_length=1)


class StoryConfigResponse(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    universe: str = Field(min_length=1)
    protagonist: str = Field(min_length=1)
    theme: str = Field(min_length=1)
    genre: str = Field(min_length=1)
    tone: str = Field(min_length=1)


class ChoiceResponse(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    choice_id: str = Field(min_length=1)
    label: str = Field(min_length=1)


class ChapterResponse(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    chapter_id: str = Field(min_length=1)
    chapter_number: int = Field(ge=1)
    title: str = Field(min_length=1)
    text: str = Field(min_length=1)


class ChoiceResolutionResponse(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    choice_id: str = Field(min_length=1)
    chapter_number: int = Field(ge=1)
    resolution_summary: str = Field(min_length=1)


class StoryAggregateResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    story_id: str
    config: StoryConfigResponse
    current_state_summary: str = Field(min_length=1)
    chapters: list[ChapterResponse] = Field(default_factory=list)
    available_choices: list[ChoiceResponse] = Field(default_factory=list)
    choice_history: list[ChoiceResolutionResponse] = Field(default_factory=list)


def map_story_aggregate_to_response(story: StoryAggregate) -> StoryAggregateResponse:
    return StoryAggregateResponse(
        story_id=story.story_id,
        config=StoryConfigResponse(
            universe=story.config.universe,
            protagonist=story.config.protagonist,
            theme=story.config.theme,
            genre=story.config.genre,
            tone=story.config.tone,
        ),
        current_state_summary=story.state.current_state_summary,
        chapters=[
            ChapterResponse(
                chapter_id=chapter.chapter_id,
                chapter_number=chapter.chapter_number,
                title=chapter.title,
                text=chapter.text,
            )
            for chapter in story.chapters
        ],
        available_choices=[
            ChoiceResponse(
                choice_id=choice.choice_id,
                label=choice.label,
            )
            for choice in story.available_choices
        ],
        choice_history=[
            ChoiceResolutionResponse(
                choice_id=choice.choice_id,
                chapter_number=choice.chapter_number,
                resolution_summary=choice.resolution_summary,
            )
            for choice in story.choice_history
        ],
    )
