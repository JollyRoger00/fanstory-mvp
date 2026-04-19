from datetime import datetime, timezone
from hashlib import sha1
from uuid import uuid4

from app.domain.models import (
    Chapter,
    Choice,
    StoryAggregate,
    StoryBible,
    StoryConfig,
    StoryState,
)
from app.services.chapter_planner import ChapterPlanningInput, plan_next_chapter
from app.services.chapter_writer import ChapterWriterResult, ChapterWritingInput, write_chapter_from_plan
from app.schemas import (
    ChapterResponse,
    ChoiceResponse,
    ChoiceResolutionResponse,
    StoryAggregateResponse,
    StoryConfigResponse,
    StoryCreateRequest,
)
from app.services.story_exceptions import StoryGenerationValidationError
from app.services.story_validation import validate_chapter_plan, validate_writer_result


def create_story_id() -> str:
    return f"story_{uuid4().hex}"


def build_story_bible(config: StoryConfig) -> StoryBible:
    return StoryBible(
        world_summary=f"История разворачивается во вселенной {config.universe}.",
        protagonist_summary=f"Главный герой или роль: {config.protagonist}.",
        tone_summary=f"Жанр: {config.genre}. Тон: {config.tone}.",
        continuity_rules=[
            f"Сохранять тему истории: {config.theme}.",
            "Уважать заявленный жанр и тон.",
            "Продолжение должно опираться на текущее состояние истории.",
        ],
    )


def build_initial_state(config: StoryConfig, bible: StoryBible) -> StoryState:
    return StoryState(
        chapter_number=1,
        current_state_summary=(
            f"История начинается в мире {config.universe}. "
            f"Главный герой: {config.protagonist}. "
            f"Тема истории: {config.theme}."
        ),
        active_goals=["Войти в первую сюжетную сцену и обозначить конфликт."],
        unresolved_tensions=[config.theme],
        known_facts=[bible.world_summary, bible.protagonist_summary],
    )


def build_choice_id(*, chapter_number: int, label: str) -> str:
    digest = sha1(f"{chapter_number}:{label}".encode("utf-8")).hexdigest()[:10]
    return f"ch{chapter_number}_{digest}"


def build_choices(
    *,
    chapter_number: int,
    choice_labels: list[str],
) -> list[Choice]:
    choices = [
        Choice(
            choice_id=build_choice_id(chapter_number=chapter_number, label=label),
            label=label,
        )
        for label in choice_labels
    ]

    choice_ids = {choice.choice_id for choice in choices}

    if len(choice_ids) != len(choices):
        raise StoryGenerationValidationError(
            "Writer вернул повторяющиеся choices. Невозможно создать стабильные choice_id."
        )

    return choices


def build_chapter(
    *,
    story_id: str,
    chapter_number: int,
    chapter_title: str,
    chapter_text: str,
    state_summary: str,
    choices: list[Choice],
) -> Chapter:
    return Chapter(
        chapter_id=f"{story_id}_chapter_{chapter_number}",
        chapter_number=chapter_number,
        title=chapter_title,
        text=chapter_text,
        state_summary_after_chapter=state_summary,
        choices=choices,
    )


def build_initial_history_summary() -> str:
    return "История только начинается. Предыдущих глав и выборов пока нет."


def build_short_history_summary(story: StoryAggregate) -> str:
    if not story.chapters:
        return build_initial_history_summary()

    chapter_summaries = [
        f"Глава {chapter.chapter_number}: {chapter.state_summary_after_chapter}"
        for chapter in story.chapters[-2:]
    ]
    choice_summaries = [
        resolution.resolution_summary for resolution in story.choice_history[-2:]
    ]

    parts = []

    if chapter_summaries:
        parts.append(" ".join(chapter_summaries))

    if choice_summaries:
        parts.append(" ".join(choice_summaries))

    return " ".join(parts)


def apply_state_update(
    *,
    previous_state: StoryState,
    chapter_number: int,
    state_summary: str,
    expected_state_delta: str,
) -> StoryState:
    return StoryState(
        chapter_number=chapter_number,
        current_state_summary=state_summary,
        active_goals=[f"Следующий шаг должен развивать: {expected_state_delta}"],
        unresolved_tensions=[state_summary],
        known_facts=[*previous_state.known_facts, expected_state_delta],
    )


def create_story_aggregate(payload: StoryCreateRequest) -> StoryAggregate:
    story_id = create_story_id()
    created_at = datetime.now(timezone.utc)

    config = StoryConfig(
        story_id=story_id,
        universe=payload.universe,
        protagonist=payload.protagonist,
        theme=payload.theme,
        genre=payload.genre,
        tone=payload.tone,
        created_at=created_at,
    )

    story_bible = build_story_bible(config)
    initial_state = build_initial_state(config, story_bible)

    plan = plan_next_chapter(
        ChapterPlanningInput(
            config=config,
            bible=story_bible,
            current_state=initial_state,
            short_history_summary=build_initial_history_summary(),
            expected_target_chapter_number=1,
        )
    )
    validate_chapter_plan(
        plan=plan,
        current_state=initial_state,
        is_initial_chapter=True,
    )

    writer_result = write_chapter_from_plan(
        ChapterWritingInput(
            config=config,
            bible=story_bible,
            current_state=initial_state,
            short_history_summary=build_initial_history_summary(),
            plan=plan,
        )
    )
    validate_writer_result(writer_result)

    choices = build_choices(
        chapter_number=plan.target_chapter_number,
        choice_labels=writer_result.choices,
    )
    chapter = build_chapter(
        story_id=story_id,
        chapter_number=plan.target_chapter_number,
        chapter_title=writer_result.chapter_title,
        chapter_text=writer_result.chapter_text,
        state_summary=writer_result.state_summary,
        choices=choices,
    )
    state = apply_state_update(
        previous_state=initial_state,
        chapter_number=plan.target_chapter_number,
        state_summary=writer_result.state_summary,
        expected_state_delta=plan.expected_state_delta,
    )

    return StoryAggregate(
        story_id=story_id,
        config=config,
        bible=story_bible,
        state=state,
        chapters=[chapter],
        available_choices=choices,
        choice_history=[],
    )


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
