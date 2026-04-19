# FanStory MVP

Минимальный MVP сервиса интерактивных AI-фанфиков с выбором действий.

Пользователь задает:
- вселенную
- персонажа
- тему истории

Сервис в будущем должен:
- генерировать историю
- показывать первую главу
- предлагать 3-4 варианта продолжения
- продолжать историю после выбора

Сейчас в репозитории уже подготовлен базовый каркас:
- `frontend` — Next.js + TypeScript
- `backend` — FastAPI
- `docs` — документация проекта

На этом этапе:
- frontend показывает стартовый экран MVP
- backend содержит минимальный endpoint `GET /health`
- интеграции между frontend и backend пока нет

## Запуск frontend

Перейдите в папку `frontend`:

```bash
cd frontend
npm install
npm run dev
```

После запуска frontend будет доступен по адресу `http://localhost:3000`.

## Запуск backend

Перейдите в папку `backend`:

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

После запуска backend будет доступен по адресу `http://127.0.0.1:8000`.

Проверка health-check:

```bash
curl http://127.0.0.1:8000/health
```
