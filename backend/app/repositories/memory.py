from app.domain.models import StoryAggregate
from app.repositories.base import StoryRepository


class InMemoryStoryRepository(StoryRepository):
    def __init__(self) -> None:
        self._stories: dict[str, StoryAggregate] = {}

    def save(self, story: StoryAggregate) -> StoryAggregate:
        stored_story = story.model_copy(deep=True)
        self._stories[story.story_id] = stored_story
        return stored_story.model_copy(deep=True)

    def get_by_id(self, story_id: str) -> StoryAggregate | None:
        story = self._stories.get(story_id)

        if story is None:
            return None

        return story.model_copy(deep=True)
