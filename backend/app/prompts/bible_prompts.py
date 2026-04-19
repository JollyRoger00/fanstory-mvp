from app.domain.models import StoryBible


def format_story_bible_for_prompt(bible: StoryBible) -> str:
    continuity_rules = (
        "\n".join(f"- {rule}" for rule in bible.continuity_rules)
        if bible.continuity_rules
        else "- Нет отдельных правил."
    )

    return f"""
StoryBible:
- World summary: {bible.world_summary}
- Protagonist summary: {bible.protagonist_summary}
- Tone summary: {bible.tone_summary}
- Continuity rules:
{continuity_rules}
""".strip()
