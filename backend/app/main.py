from fastapi import FastAPI

app = FastAPI(
    title="FanStory MVP API",
    description="Минимальный backend для интерактивных AI-фанфиков.",
)


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}
