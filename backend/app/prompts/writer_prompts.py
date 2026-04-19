from app.domain.models import Chapter, Choice, StoryBible, StoryConfig, StoryState
from app.prompts.bible_prompts import format_story_bible_for_prompt
from app.prompts.planner_prompts import (
    format_last_chapter_for_prompt,
    format_selected_choice_for_prompt,
    format_story_state_for_prompt,
)
from app.services.chapter_planner import ChapterPlan


def build_writer_instructions() -> str:
    return (
        "Ты chapter writer для интерактивного AI-фанфика. "
        "Пиши только одну главу на основе уже готового плана. "
        "Верни только структурированный результат. "
        "Choices должны быть конкретными действиями героя и соответствовать плану."
    )


def build_writer_prompt(
    *,
    config: StoryConfig,
    bible: StoryBible,
    current_state: StoryState,
    short_history_summary: str,
    last_chapter: Chapter | None,
    selected_choice: Choice | None,
    plan: ChapterPlan,
) -> str:
    plan_beats = "\n".join(f"- {beat}" for beat in plan.beat_outline)
    continuity_constraints = "\n".join(
        f"- {constraint}" for constraint in plan.continuity_constraints
    )
    candidate_choices = "\n".join(
        f"- {choice}" for choice in plan.candidate_choices
    )

    return f"""
Напиши следующую главу интерактивного фанфика по готовому плану.

StoryConfig:
- Universe: {config.universe}
- Protagonist: {config.protagonist}
- Theme: {config.theme}
- Genre: {config.genre}
- Tone: {config.tone}

{format_story_bible_for_prompt(bible)}

{format_story_state_for_prompt(current_state)}

Short history summary:
{short_history_summary}

{format_last_chapter_for_prompt(last_chapter)}

{format_selected_choice_for_prompt(selected_choice)}

ChapterPlan:
- target_chapter_number: {plan.target_chapter_number}
- scene_goal: {plan.scene_goal}
- main_conflict: {plan.main_conflict}
- beat_outline:
{plan_beats}
- continuity_constraints:
{continuity_constraints}
- expected_state_delta: {plan.expected_state_delta}
- candidate_choices:
{candidate_choices}

Requirements:
- write exactly one chapter
- chapter title must match the scene
- chapter text must be coherent prose
- return 3 or 4 choices
- choice labels must stay distinct
- state_summary must clearly reflect the updated story situation
""".strip()


def build_raw_story_instructions() -> str:
    return (
        "Ты пишешь только первую главу интерактивного AI-фанфика. "
        "Верни обычный текст без JSON и без markdown-оберток. "
        "Сначала дай chapter title, потом chapter text, затем 3 choices и state summary."
    )


def build_raw_story_prompt(
    *,
    universe: str,
    protagonist: str,
    theme: str,
    genre: str,
    tone: str,
) -> str:
    return f"""
Создай первую главу интерактивного фанфика.

Данные истории:
- Вселенная: {universe}
- Главный герой: {protagonist}
- Тема: {theme}
- Жанр: {genre}
- Тон: {tone}

Верни обычный текст в таком порядке:
1. Chapter title
2. Chapter text
3. 3 choices
4. State summary
""".strip()
