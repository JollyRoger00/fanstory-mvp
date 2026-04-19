from pydantic import BaseModel, ConfigDict, Field


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
