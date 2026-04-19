from abc import ABC, abstractmethod

from app.domain.models import StoryAggregate


class StoryRepository(ABC):
    @abstractmethod
    def save(self, story: StoryAggregate) -> StoryAggregate:
        raise NotImplementedError

    @abstractmethod
    def get_by_id(self, story_id: str) -> StoryAggregate | None:
        raise NotImplementedError
