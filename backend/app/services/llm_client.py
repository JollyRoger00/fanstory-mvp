from os import getenv
from typing import Any, TypeVar

from openai import OpenAI
from pydantic import BaseModel, ValidationError

DEFAULT_OPENAI_MODEL = "gpt-5.4"
OPENAI_PING_MODEL = "gpt-5.4-mini"

StructuredResponseT = TypeVar("StructuredResponseT", bound=BaseModel)


class OpenAIIntegrationError(Exception):
    def __init__(
        self,
        message: str,
        *,
        error_type: str | None = None,
        error_message: str | None = None,
        status_code: int | None = None,
        response_body: Any | None = None,
    ) -> None:
        super().__init__(message)
        self.error_type = error_type or self.__class__.__name__
        self.error_message = error_message or message
        self.status_code = status_code
        self.response_body = response_body


class MissingOpenAIAPIKeyError(OpenAIIntegrationError):
    pass


class OpenAIRequestError(OpenAIIntegrationError):
    pass


class InvalidOpenAIResponseError(OpenAIIntegrationError):
    pass


def extract_exception_details(exc: Exception) -> dict[str, Any]:
    status_code = getattr(exc, "status_code", None)
    error_message = getattr(exc, "message", None) or str(exc)
    response_body = getattr(exc, "body", None)
    response = getattr(exc, "response", None)

    if response_body is None and response is not None:
        response_body = getattr(response, "text", None)

        if response_body is None and hasattr(response, "json"):
            try:
                response_body = response.json()
            except Exception:
                response_body = None

    return {
        "error_type": type(exc).__name__,
        "error_message": error_message,
        "status_code": status_code,
        "response_body": response_body,
    }


def log_exception_details(exc: Exception) -> None:
    details = extract_exception_details(exc)

    print("[OpenAI debug] exception_type:", details["error_type"])
    print("[OpenAI debug] exception_text:", details["error_message"])

    if details["status_code"] is not None:
        print("[OpenAI debug] status_code:", details["status_code"])

    if details["response_body"] is not None:
        print("[OpenAI debug] response_body:", details["response_body"])


def serialize_openai_error(error: OpenAIIntegrationError) -> dict[str, Any]:
    return {
        "error_type": error.error_type,
        "error_message": error.error_message,
        "status_code": error.status_code,
        "response_body": error.response_body,
    }


def get_openai_client() -> OpenAI:
    api_key = getenv("OPENAI_API_KEY")

    if not api_key:
        print("[OpenAI debug] exception_type: MissingOpenAIAPIKeyError")
        print("[OpenAI debug] exception_text: OPENAI_API_KEY is missing")
        raise MissingOpenAIAPIKeyError(
            "OPENAI_API_KEY не задан. Добавьте ключ в переменные окружения backend.",
            error_message="OPENAI_API_KEY is missing",
        )

    return OpenAI(api_key=api_key)


def get_openai_model() -> str:
    return getenv("OPENAI_MODEL", DEFAULT_OPENAI_MODEL)


def request_text_output(
    *,
    model: str,
    user_input: str,
    instructions: str | None = None,
) -> str:
    client = get_openai_client()

    try:
        response = client.responses.create(
            model=model,
            instructions=instructions,
            input=user_input,
        )
    except Exception as exc:
        log_exception_details(exc)
        details = extract_exception_details(exc)
        raise OpenAIRequestError(
            "Не удалось получить ответ от OpenAI. Попробуйте снова позже.",
            error_type=details["error_type"],
            error_message=details["error_message"],
            status_code=details["status_code"],
            response_body=details["response_body"],
        ) from exc

    output_text = response.output_text

    if not output_text:
        print("[OpenAI debug] empty output_text received from Responses API.")
        raise InvalidOpenAIResponseError(
            "OpenAI вернул пустой текстовый ответ.",
            error_message="Empty output_text returned by Responses API",
        )

    return output_text


def request_structured_output(
    *,
    instructions: str,
    user_input: str,
    response_model: type[StructuredResponseT],
) -> StructuredResponseT:
    client = get_openai_client()

    try:
        # SDK сам превращает Pydantic-модель в JSON schema для Structured Outputs.
        response = client.responses.parse(
            model=get_openai_model(),
            instructions=instructions,
            input=user_input,
            text_format=response_model,
        )
    except ValidationError as exc:
        log_exception_details(exc)
        details = extract_exception_details(exc)
        raise InvalidOpenAIResponseError(
            "OpenAI вернул ответ, который не прошел проверку структуры.",
            error_type=details["error_type"],
            error_message=details["error_message"],
            status_code=details["status_code"],
            response_body=details["response_body"],
        ) from exc
    except Exception as exc:
        log_exception_details(exc)
        details = extract_exception_details(exc)
        raise OpenAIRequestError(
            "Не удалось получить ответ от OpenAI. Попробуйте снова позже.",
            error_type=details["error_type"],
            error_message=details["error_message"],
            status_code=details["status_code"],
            response_body=details["response_body"],
        ) from exc

    parsed_output = response.output_parsed

    if parsed_output is None:
        print("[OpenAI debug] output_parsed is empty after structured response parsing.")
        raise InvalidOpenAIResponseError(
            "OpenAI вернул пустой или невалидный структурированный ответ.",
            error_message="Structured response is empty or could not be parsed",
        )

    if not isinstance(parsed_output, response_model):
        print("[OpenAI debug] output_parsed has unexpected type:", type(parsed_output).__name__)
        raise InvalidOpenAIResponseError(
            "OpenAI вернул ответ в неожиданном формате.",
            error_message=f"Unexpected parsed output type: {type(parsed_output).__name__}",
        )

    return parsed_output
