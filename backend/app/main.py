from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.dto.stories import StoryCreateRequest
from app.api.routes.stories import router as stories_router
from app.services.llm_client import (
    InvalidOpenAIResponseError,
    MissingOpenAIAPIKeyError,
    OPENAI_PING_MODEL,
    OpenAIRequestError,
    get_openai_model,
    request_text_output,
    serialize_openai_error,
)
from app.services.story_engine import generate_first_chapter_raw_text

app = FastAPI(
    title="FanStory MVP API",
    description="Минимальный backend для интерактивных AI-фанфиков.",
)

BACKEND_ENV_PATH = Path(__file__).resolve().parents[1] / ".env"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def load_backend_environment() -> None:
    env_loaded = load_dotenv(BACKEND_ENV_PATH)

    if env_loaded:
        print(f"[startup] Environment loaded from {BACKEND_ENV_PATH}")
    else:
        print(f"[startup] .env file not found at {BACKEND_ENV_PATH}")


app.include_router(stories_router)


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/debug/openai-ping")
async def debug_openai_ping() -> dict[str, Any]:
    try:
        output_text = request_text_output(
            model=OPENAI_PING_MODEL,
            user_input="Reply with: pong",
        )
    except MissingOpenAIAPIKeyError as exc:
        return {
            "ok": False,
            "model": OPENAI_PING_MODEL,
            **serialize_openai_error(exc),
        }
    except OpenAIRequestError as exc:
        return {
            "ok": False,
            "model": OPENAI_PING_MODEL,
            **serialize_openai_error(exc),
        }
    except InvalidOpenAIResponseError as exc:
        return {
            "ok": False,
            "model": OPENAI_PING_MODEL,
            **serialize_openai_error(exc),
        }

    return {
        "ok": True,
        "model": OPENAI_PING_MODEL,
        "output_text": output_text,
    }


@app.post("/debug/openai-story-raw")
async def debug_openai_story_raw(payload: StoryCreateRequest) -> dict[str, Any]:
    try:
        output_text = generate_first_chapter_raw_text(
            universe=payload.universe,
            protagonist=payload.protagonist,
            theme=payload.theme,
            genre=payload.genre,
            tone=payload.tone,
        )
    except MissingOpenAIAPIKeyError as exc:
        return {
            "ok": False,
            "model": get_openai_model(),
            **serialize_openai_error(exc),
        }
    except OpenAIRequestError as exc:
        return {
            "ok": False,
            "model": get_openai_model(),
            **serialize_openai_error(exc),
        }
    except InvalidOpenAIResponseError as exc:
        return {
            "ok": False,
            "model": get_openai_model(),
            **serialize_openai_error(exc),
        }

    return {
        "ok": True,
        "model": get_openai_model(),
        "output_text": output_text,
    }
