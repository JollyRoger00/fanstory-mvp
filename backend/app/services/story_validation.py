from app.domain.models import StoryState
from app.services.chapter_planner import ChapterPlan
from app.services.chapter_writer import ChapterWriterResult
from app.services.story_exceptions import StoryGenerationValidationError


def validate_distinct_choice_labels(choice_labels: list[str]) -> None:
    if len(set(choice_labels)) != len(choice_labels):
        raise StoryGenerationValidationError(
            "Planner или Writer вернул дублирующиеся choices."
        )


def validate_chapter_plan(
    *,
    plan: ChapterPlan,
    current_state: StoryState,
    is_initial_chapter: bool,
) -> None:
    expected_target = (
        current_state.chapter_number
        if is_initial_chapter
        else current_state.chapter_number + 1
    )

    if plan.target_chapter_number != expected_target:
        raise StoryGenerationValidationError(
            "Planner вернул неверный target_chapter_number."
        )

    if len(plan.candidate_choices) not in (3, 4):
        raise StoryGenerationValidationError(
            "Planner должен вернуть 3 или 4 candidate choices."
        )

    validate_distinct_choice_labels(plan.candidate_choices)


def validate_writer_result(writer_result: ChapterWriterResult) -> None:
    if not writer_result.state_summary.strip():
        raise StoryGenerationValidationError("Writer вернул пустой state_summary.")

    if len(writer_result.choices) not in (3, 4):
        raise StoryGenerationValidationError(
            "Writer должен вернуть 3 или 4 choices."
        )

    validate_distinct_choice_labels(writer_result.choices)
