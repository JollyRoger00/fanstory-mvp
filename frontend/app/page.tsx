"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";

type StoryFormValues = {
  universe: string;
  protagonist: string;
  theme: string;
  genre: string;
  tone: string;
};

type StoryConfig = StoryFormValues;

type Choice = {
  choice_id: string;
  label: string;
};

type Chapter = {
  chapter_id: string;
  chapter_number: number;
  title: string;
  text: string;
};

type ChoiceResolution = {
  choice_id: string;
  chapter_number: number;
  resolution_summary: string;
};

type StoryAggregateResponse = {
  story_id: string;
  config: StoryConfig;
  current_state_summary: string;
  chapters: Chapter[];
  available_choices: Choice[];
  choice_history: ChoiceResolution[];
};

const initialFormValues: StoryFormValues = {
  universe: "Гарри Поттер",
  protagonist: "Ученица, которая случайно нашла секретный ход",
  theme: "Тайна, взросление и рискованный выбор в запретной части замка.",
  genre: "Фэнтези",
  tone: "Таинственный"
};

function getErrorMessage(data: unknown): string {
  if (typeof data !== "object" || data === null || !("detail" in data)) {
    return "Не удалось создать историю.";
  }

  const detail = data.detail;

  if (typeof detail === "string") {
    return detail;
  }

  return "Проверьте заполнение формы и попробуйте снова.";
}

export default function HomePage() {
  const [formValues, setFormValues] = useState<StoryFormValues>(initialFormValues);
  const [story, setStory] = useState<StoryAggregateResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChoosing, setIsChoosing] = useState(false);
  const [activeChoiceId, setActiveChoiceId] = useState<string | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/stories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formValues)
      });

      const data = (await response.json()) as StoryAggregateResponse | { detail?: unknown };

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      setStory(data as StoryAggregateResponse);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Не удалось создать историю.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleChoose(choiceId: string) {
    if (!story || isChoosing) {
      return;
    }

    setIsChoosing(true);
    setActiveChoiceId(choiceId);
    setErrorMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/stories/${story.story_id}/choose`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ choice_id: choiceId })
      });

      const data = (await response.json()) as StoryAggregateResponse | { detail?: unknown };

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      setStory(data as StoryAggregateResponse);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Не удалось продолжить историю.");
      }
    } finally {
      setIsChoosing(false);
      setActiveChoiceId(null);
    }
  }

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">FanStory MVP</p>
        <h1>Создание истории для первого MVP-среза</h1>
        <p className="lead">
          Заполните форму и отправьте данные в backend. Сервис вызовет OpenAI
          только на сервере, сгенерирует первую главу и сразу покажет результат
          вместе с вариантами выбора.
        </p>
      </section>

      <section className="grid">
        <div className="card">
          <h2>Данные для истории</h2>
          <form className="story-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Вселенная</span>
              <input
                type="text"
                name="universe"
                value={formValues.universe}
                onChange={handleChange}
                required
              />
            </label>

            <label className="field">
              <span>Персонаж</span>
              <input
                type="text"
                name="protagonist"
                value={formValues.protagonist}
                onChange={handleChange}
                required
              />
            </label>

            <label className="field">
              <span>Тема истории</span>
              <textarea
                name="theme"
                value={formValues.theme}
                onChange={handleChange}
                required
              />
            </label>

            <label className="field">
              <span>Жанр</span>
              <input
                type="text"
                name="genre"
                value={formValues.genre}
                onChange={handleChange}
                required
              />
            </label>

            <label className="field">
              <span>Тон</span>
              <input
                type="text"
                name="tone"
                value={formValues.tone}
                onChange={handleChange}
                required
              />
            </label>

            {errorMessage && !story ? <p className="error-message">{errorMessage}</p> : null}

            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? "Создание..." : "Создать историю"}
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Созданная история</h2>

          {errorMessage && story ? <p className="error-message">{errorMessage}</p> : null}

          {story ? (
            <div className="story-stack">
              <dl className="story-details">
                <div className="story-detail">
                  <dt>story_id</dt>
                  <dd>{story.story_id}</dd>
                </div>

                <div className="story-detail">
                  <dt>Вселенная</dt>
                  <dd>{story.config.universe}</dd>
                </div>

                <div className="story-detail">
                  <dt>Персонаж</dt>
                  <dd>{story.config.protagonist}</dd>
                </div>

                <div className="story-detail">
                  <dt>Тема</dt>
                  <dd>{story.config.theme}</dd>
                </div>

                <div className="story-detail">
                  <dt>Жанр</dt>
                  <dd>{story.config.genre}</dd>
                </div>

                <div className="story-detail">
                  <dt>Тон</dt>
                  <dd>{story.config.tone}</dd>
                </div>
              </dl>

              <section className="chapter-card">
                <p className="section-label">Текущее состояние</p>
                <p className="chapter-text">{story.current_state_summary}</p>
              </section>

              {story.chapters.map((chapter) => (
                <section key={chapter.chapter_id} className="chapter-card">
                  <p className="section-label">Глава {chapter.chapter_number}</p>
                  <h3>{chapter.title}</h3>
                  <p className="chapter-text">{chapter.text}</p>
                </section>
              ))}

              <section className="chapter-card">
                <p className="section-label">Доступные choices</p>
                {isChoosing ? <p className="status-note">Generating the next chapter...</p> : null}
                <ul className="choice-list">
                  {story.available_choices.map((choice) => (
                    <li key={choice.choice_id} className="choice-item">
                      <button
                        type="button"
                        className="choice-button"
                        onClick={() => handleChoose(choice.choice_id)}
                        disabled={isChoosing}
                      >
                        {activeChoiceId === choice.choice_id ? "Generating..." : choice.label}
                      </button>
                      <span className="choice-meta">{choice.choice_id}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="chapter-card">
                <p className="section-label">История выборов</p>
                {story.choice_history.length > 0 ? (
                  <ul className="choice-list">
                    {story.choice_history.map((choice) => (
                      <li key={`${choice.chapter_number}-${choice.choice_id}`} className="choice-item">
                        <span className="choice-label">{choice.resolution_summary}</span>
                        <span className="choice-meta">
                          chapter {choice.chapter_number} / {choice.choice_id}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-state">Пока история выборов пустая.</p>
                )}
              </section>
            </div>
          ) : (
            <p className="empty-state">
              История появится здесь после успешной отправки формы.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
