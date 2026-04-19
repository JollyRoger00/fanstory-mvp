from app.domain.models import ChoiceResolution, StoryAggregate
from app.repositories.base import StoryRepository
from app.services.chapter_planner import ChapterPlanningInput, plan_next_chapter
from app.services.chapter_writer import ChapterWritingInput, write_chapter_from_plan
from app.services.story_exceptions import (
    ChoiceAlreadyUsedError,
    InvalidChoiceError,
    StoryNotFoundError,
)
from app.services.story_service import (
    apply_state_update,
    build_chapter,
    build_choices,
    build_short_history_summary,
)
from app.services.story_validation import validate_chapter_plan, validate_writer_result


def continue_story(
    *,
    story_id: str,
    choice_id: str,
    repository: StoryRepository,
) -> StoryAggregate:
    story = repository.get_by_id(story_id)

    if story is None:
        raise StoryNotFoundError("Story not found")

    if any(resolution.choice_id == choice_id for resolution in story.choice_history):
        raise ChoiceAlreadyUsedError("Choice already used")

    selected_choice = next(
        (choice for choice in story.available_choices if choice.choice_id == choice_id),
        None,
    )

    if selected_choice is None:
        known_choice_ids = {
            choice.choice_id
            for chapter in story.chapters
            for choice in chapter.choices
        }

        if choice_id in known_choice_ids:
            raise ChoiceAlreadyUsedError("Choice already used")

        raise InvalidChoiceError("Invalid choice")

    short_history_summary = build_short_history_summary(story)
    last_chapter = story.chapters[-1] if story.chapters else None

    plan = plan_next_chapter(
        ChapterPlanningInput(
            config=story.config,
            bible=story.bible,
            current_state=story.state,
            short_history_summary=short_history_summary,
            last_chapter=last_chapter,
            selected_choice=selected_choice,
            expected_target_chapter_number=story.state.chapter_number + 1,
        )
    )
    validate_chapter_plan(
        plan=plan,
        current_state=story.state,
        is_initial_chapter=False,
    )

    writer_result = write_chapter_from_plan(
        ChapterWritingInput(
            config=story.config,
            bible=story.bible,
            current_state=story.state,
            short_history_summary=short_history_summary,
            plan=plan,
            last_chapter=last_chapter,
            selected_choice=selected_choice,
        )
    )
    validate_writer_result(writer_result)

    choices = build_choices(
        chapter_number=plan.target_chapter_number,
        choice_labels=writer_result.choices,
    )
    chapter = build_chapter(
        story_id=story.story_id,
        chapter_number=plan.target_chapter_number,
        chapter_title=writer_result.chapter_title,
        chapter_text=writer_result.chapter_text,
        state_summary=writer_result.state_summary,
        choices=choices,
    )
    updated_state = apply_state_update(
        previous_state=story.state,
        chapter_number=plan.target_chapter_number,
        state_summary=writer_result.state_summary,
        expected_state_delta=plan.expected_state_delta,
    )
    resolution = ChoiceResolution(
        choice_id=selected_choice.choice_id,
        chapter_number=story.state.chapter_number,
        resolution_summary=(
            f'Selected choice: "{selected_choice.label}". '
            f"State change: {plan.expected_state_delta}"
        ),
    )

    updated_story = StoryAggregate(
        story_id=story.story_id,
        config=story.config,
        bible=story.bible,
        state=updated_state,
        chapters=[*story.chapters, chapter],
        available_choices=choices,
        choice_history=[*story.choice_history, resolution],
    )

    return repository.save(updated_story)
