class StoryServiceError(Exception):
    pass


class StoryNotFoundError(StoryServiceError):
    pass


class InvalidChoiceError(StoryServiceError):
    pass


class ChoiceAlreadyUsedError(StoryServiceError):
    pass


class StoryGenerationValidationError(StoryServiceError):
    pass
