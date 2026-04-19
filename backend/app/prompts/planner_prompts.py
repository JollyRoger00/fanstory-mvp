from app.domain.models import Chapter, Choice, StoryBible, StoryConfig, StoryState
from app.prompts.bible_prompts import format_story_bible_for_prompt


def format_story_state_for_prompt(state: StoryState) -> str:
    active_goals = ", ".join(state.active_goals) if state.active_goals else "Нет"
    unresolved_tensions = (
        ", ".join(state.unresolved_tensions) if state.unresolved_tensions else "Нет"
    )
    known_facts = ", ".join(state.known_facts) if state.known_facts else "Нет"

    return f"""
StoryState:
- Current chapter number: {state.chapter_number}
- Current summary: {state.current_state_summary}
- Active goals: {active_goals}
- Unresolved tensions: {unresolved_tensions}
- Known facts: {known_facts}
""".strip()


def format_last_chapter_for_prompt(last_chapter: Chapter | None) -> str:
    if last_chapter is None:
        return "Last chapter: Нет предыдущей главы."

    return f"""
Last chapter:
- Chapter number: {last_chapter.chapter_number}
- Title: {last_chapter.title}
- Text: {last_chapter.text}
""".strip()


def format_selected_choice_for_prompt(selected_choice: Choice | None) -> str:
    if selected_choice is None:
        return "Selected choice: Нет выбранного choice."

    return (
        "Selected choice:\n"
        f"- choice_id: {selected_choice.choice_id}\n"
        f"- label: {selected_choice.label}"
    )


def build_planner_instructions() -> str:
    return (
        "Ты narrative planner для интерактивного AI-фанфика. "
        "Твоя задача — спланировать следующую главу, а не писать финальную прозу. "
        "Верни только структурированный результат. "
        "План должен быть согласован с текущим StoryState, StoryBible и выбранным choice."
    )


def build_planner_prompt(
    *,
    config: StoryConfig,
    bible: StoryBible,
    current_state: StoryState,
    short_history_summary: str,
    last_chapter: Chapter | None,
    selected_choice: Choice | None,
    expected_target_chapter_number: int,
) -> str:
    return f"""
Подготовь план следующей главы интерактивного фанфика.

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

Requirements:
- target_chapter_number must be exactly {expected_target_chapter_number}
- scene_goal must be specific
- main_conflict must be clear and story-relevant
- beat_outline should be a short ordered list of narrative beats
- continuity_constraints must reference continuity and tone
- expected_state_delta should describe how state must change
- candidate_choices must contain 3 or 4 distinct actionable options
- do not write final chapter prose
""".strip()
