from app.repositories.base import StoryRepository
from app.repositories.memory import InMemoryStoryRepository

story_repository = InMemoryStoryRepository()


def get_story_repository() -> StoryRepository:
    return story_repository
