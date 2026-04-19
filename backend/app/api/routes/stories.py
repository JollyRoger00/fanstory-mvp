from fastapi import APIRouter, Depends, HTTPException

from app.api.dto.stories import (
    StoryAggregateResponse,
    StoryChooseRequest,
    StoryCreateRequest,
    map_story_aggregate_to_response,
)
from app.dependencies import get_story_repository
from app.repositories.base import StoryRepository
from app.services.llm_client import (
    InvalidOpenAIResponseError,
    MissingOpenAIAPIKeyError,
    OpenAIRequestError,
)
from app.services.story_continuation_service import continue_story
from app.services.story_exceptions import (
    ChoiceAlreadyUsedError,
    InvalidChoiceError,
    StoryGenerationValidationError,
    StoryNotFoundError,
)
from app.services.story_service import create_story_aggregate

router = APIRouter(tags=["stories"])

STORY_NOT_FOUND_DETAIL = "story not found"
INVALID_CHOICE_DETAIL = "invalid choice"
CHOICE_ALREADY_USED_DETAIL = "choice already used"
GENERATION_FAILED_DETAIL = "generation failed"
INTERNAL_SERVER_ERROR_DETAIL = "internal server error"


def _log_route_error(route_label: str, exc: Exception) -> None:
    error_message = getattr(exc, "error_message", str(exc))
    print(f"[{route_label}] {type(exc).__name__}:", error_message)


@router.post("/stories", response_model=StoryAggregateResponse, status_code=201)
async def create_story(
    payload: StoryCreateRequest,
    repository: StoryRepository = Depends(get_story_repository),
) -> StoryAggregateResponse:
    try:
        story = create_story_aggregate(
            universe=payload.universe,
            protagonist=payload.protagonist,
            theme=payload.theme,
            genre=payload.genre,
            tone=payload.tone,
        )
    except MissingOpenAIAPIKeyError as exc:
        _log_route_error("POST /stories", exc)
        raise HTTPException(status_code=500, detail=INTERNAL_SERVER_ERROR_DETAIL) from exc
    except (
        OpenAIRequestError,
        InvalidOpenAIResponseError,
        StoryGenerationValidationError,
    ) as exc:
        _log_route_error("POST /stories", exc)
        raise HTTPException(status_code=502, detail=GENERATION_FAILED_DETAIL) from exc
    except Exception as exc:
        _log_route_error("POST /stories", exc)
        raise HTTPException(status_code=500, detail=INTERNAL_SERVER_ERROR_DETAIL) from exc

    stored_story = repository.save(story)
    return map_story_aggregate_to_response(stored_story)


@router.get("/stories/{story_id}", response_model=StoryAggregateResponse)
async def get_story(
    story_id: str,
    repository: StoryRepository = Depends(get_story_repository),
) -> StoryAggregateResponse:
    story = repository.get_by_id(story_id)

    if story is None:
        raise HTTPException(status_code=404, detail=STORY_NOT_FOUND_DETAIL)

    return map_story_aggregate_to_response(story)


@router.post("/stories/{story_id}/choose", response_model=StoryAggregateResponse)
async def choose_story_branch(
    story_id: str,
    payload: StoryChooseRequest,
    repository: StoryRepository = Depends(get_story_repository),
) -> StoryAggregateResponse:
    try:
        updated_story = continue_story(
            story_id=story_id,
            choice_id=payload.choice_id,
            repository=repository,
        )
    except StoryNotFoundError as exc:
        raise HTTPException(status_code=404, detail=STORY_NOT_FOUND_DETAIL) from exc
    except InvalidChoiceError as exc:
        raise HTTPException(status_code=400, detail=INVALID_CHOICE_DETAIL) from exc
    except ChoiceAlreadyUsedError as exc:
        raise HTTPException(status_code=409, detail=CHOICE_ALREADY_USED_DETAIL) from exc
    except MissingOpenAIAPIKeyError as exc:
        _log_route_error("POST /stories/{story_id}/choose", exc)
        raise HTTPException(status_code=500, detail=INTERNAL_SERVER_ERROR_DETAIL) from exc
    except (
        OpenAIRequestError,
        InvalidOpenAIResponseError,
        StoryGenerationValidationError,
    ) as exc:
        _log_route_error("POST /stories/{story_id}/choose", exc)
        raise HTTPException(status_code=502, detail=GENERATION_FAILED_DETAIL) from exc
    except Exception as exc:
        _log_route_error("POST /stories/{story_id}/choose", exc)
        raise HTTPException(status_code=500, detail=INTERNAL_SERVER_ERROR_DETAIL) from exc

    return map_story_aggregate_to_response(updated_story)
