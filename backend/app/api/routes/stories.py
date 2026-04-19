from fastapi import APIRouter, Depends, HTTPException

from app.dependencies import get_story_repository
from app.repositories.base import StoryRepository
from app.schemas import StoryAggregateResponse, StoryChooseRequest, StoryCreateRequest
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
from app.services.story_service import (
    create_story_aggregate,
    map_story_aggregate_to_response,
)

router = APIRouter(tags=["stories"])


@router.post("/stories", response_model=StoryAggregateResponse, status_code=201)
async def create_story(
    payload: StoryCreateRequest,
    repository: StoryRepository = Depends(get_story_repository),
) -> StoryAggregateResponse:
    try:
        story = create_story_aggregate(payload)
    except MissingOpenAIAPIKeyError as exc:
        print("[POST /stories] MissingOpenAIAPIKeyError:", exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except OpenAIRequestError as exc:
        print("[POST /stories] OpenAIRequestError:", exc.error_message)
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except InvalidOpenAIResponseError as exc:
        print("[POST /stories] InvalidOpenAIResponseError:", exc.error_message)
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except StoryGenerationValidationError as exc:
        print("[POST /stories] StoryGenerationValidationError:", exc)
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    stored_story = repository.save(story)
    return map_story_aggregate_to_response(stored_story)


@router.get("/stories/{story_id}", response_model=StoryAggregateResponse)
async def get_story(
    story_id: str,
    repository: StoryRepository = Depends(get_story_repository),
) -> StoryAggregateResponse:
    story = repository.get_by_id(story_id)

    if story is None:
        raise HTTPException(status_code=404, detail="Story not found")

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
        raise HTTPException(status_code=404, detail="story not found") from exc
    except InvalidChoiceError as exc:
        raise HTTPException(status_code=400, detail="invalid choice") from exc
    except ChoiceAlreadyUsedError as exc:
        raise HTTPException(status_code=409, detail="choice already used") from exc
    except MissingOpenAIAPIKeyError as exc:
        print("[POST /stories/{story_id}/choose] MissingOpenAIAPIKeyError:", exc)
        raise HTTPException(status_code=500, detail="internal server error") from exc
    except OpenAIRequestError as exc:
        print("[POST /stories/{story_id}/choose] OpenAIRequestError:", exc.error_message)
        raise HTTPException(status_code=502, detail="generation failed") from exc
    except InvalidOpenAIResponseError as exc:
        print(
            "[POST /stories/{story_id}/choose] InvalidOpenAIResponseError:",
            exc.error_message,
        )
        raise HTTPException(status_code=502, detail="generation failed") from exc
    except StoryGenerationValidationError as exc:
        print("[POST /stories/{story_id}/choose] StoryGenerationValidationError:", exc)
        raise HTTPException(status_code=502, detail="generation failed") from exc
    except Exception as exc:
        print("[POST /stories/{story_id}/choose] Unexpected error:", type(exc).__name__, exc)
        raise HTTPException(status_code=500, detail="internal server error") from exc

    return map_story_aggregate_to_response(updated_story)
