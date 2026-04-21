import { slugify } from "@/lib/utils";
import type { StoryContentLanguage } from "@/entities/story/language";
import type {
  AppliedChoiceResult,
  ApplyChoiceRequest,
  GeneratedChapter,
  GeneratedChoice,
  GeneratedInitialStory,
  GenerateNextChapterRequest,
  InitialStoryRequest,
  StoryGenerationProvider,
  StoryStateSnapshot,
} from "@/server/story-generation/types";

function toChoiceKey(chapterNumber: number, label: string, position: number) {
  return `ch${chapterNumber}-${position + 1}-${slugify(label).slice(0, 24)}`;
}

function lower(value: string, language: StoryContentLanguage) {
  return value.toLocaleLowerCase(language === "ru" ? "ru-RU" : "en-US");
}

function makeChoices(
  chapterNumber: number,
  seeds: Array<{ label: string; outcomeHint: string }>,
): GeneratedChoice[] {
  return seeds.map((seed, index) => ({
    key: toChoiceKey(chapterNumber, seed.label, index),
    label: seed.label,
    outcomeHint: seed.outcomeHint,
  }));
}

function createInitialChoices(input: InitialStoryRequest) {
  if (input.contentLanguage === "ru") {
    return makeChoices(1, [
      {
        label: `Проследовать к первой трещине в ${input.universe}`,
        outcomeHint: "Сразу углубиться в ядро конфликта и поднять ставки.",
      },
      {
        label: `Довериться союзнику, который знает ${input.protagonist}`,
        outcomeHint: "Получить контекст и рискнуть контролем над ситуацией.",
      },
      {
        label: "Скрыть находку и изучить закономерность в одиночку",
        outcomeHint:
          "Сохранить секрет и собрать преимущество до следующего шага.",
      },
    ]);
  }

  return makeChoices(1, [
    {
      label: `Follow the first fracture in ${input.universe}`,
      outcomeHint: "Push deeper into the core mystery immediately.",
    },
    {
      label: `Confide in an ally who knows ${input.protagonist}`,
      outcomeHint: "Build trust and trade momentum for context.",
    },
    {
      label: "Hide the discovery and study the pattern alone",
      outcomeHint: "Stay secretive and gather leverage before moving.",
    },
  ]);
}

function createInitialState(input: InitialStoryRequest): StoryStateSnapshot {
  if (input.contentLanguage === "ru") {
    return {
      summary: `${input.protagonist} оказывается в нестабильной точке внутри ${input.universe}, где ${lower(input.theme, "ru")} уже невозможно игнорировать.`,
      activeGoals: [
        `Понять, почему ${lower(input.theme, "ru")} выходит на первый план именно сейчас.`,
        `Сохранить ритм истории в ${lower(input.tone, "ru")} тональности.`,
      ],
      unresolvedTensions: [
        `${input.theme} уже действует, но его природа всё ещё понята не до конца.`,
        "Герой пока не понимает, кому здесь действительно можно доверять.",
      ],
      knownFacts: [
        `Вселенная: ${input.universe}`,
        `Жанр: ${input.genre}`,
        `Базовая завязка: ${input.synopsis}`,
      ],
    };
  }

  return {
    summary: `${input.protagonist} has stepped into a volatile opening inside ${input.universe}, where ${lower(input.theme, "en")} has become impossible to ignore.`,
    activeGoals: [
      `Understand why ${lower(input.theme, "en")} matters now.`,
      `Keep narrative momentum aligned with a ${lower(input.tone, "en")} tone.`,
    ],
    unresolvedTensions: [
      `${input.theme} is active but still poorly understood.`,
      "The protagonist does not yet know who can be trusted.",
    ],
    knownFacts: [
      `Universe: ${input.universe}`,
      `Genre: ${input.genre}`,
      `Core promise: ${input.synopsis}`,
    ],
  };
}

function createFirstChapter(
  input: InitialStoryRequest,
  choices: GeneratedChoice[],
) {
  if (input.contentLanguage === "ru") {
    return {
      title: "Первая трещина",
      summary: `${input.protagonist} замечает первый необратимый знак того, что ${lower(input.theme, "ru")} вот-вот изменит правила мира.`,
      text: [
        `${input.protagonist} ожидал, что ${input.universe} сохранит привычную форму хотя бы ещё на одну ночь, но первый разлом пришёл раньше. Он был завёрнут в язык ${lower(input.theme, "ru")}: достаточно тихий, чтобы его отрицать, и достаточно острый, чтобы оставить след.`,
        `Это не разовый синопсис и не статичная завязка. С этого момента история работает как живая система с непрерывностью, давлением и выбором, который действительно меняет траекторию. ${input.genre} остаётся жанровым каркасом, ${input.tone} удерживает интонацию, а следующее решение уже начинает перестраивать сцену.`,
        `Когда напряжение оседает, безопасных направлений почти не остаётся. Каждый следующий шаг открывает другую версию истории, и ни одна из них не обещает лёгкого исхода.`,
      ].join("\n\n"),
      choices,
    };
  }

  return {
    title: "The First Fracture",
    summary: `${input.protagonist} notices the first irreversible sign that ${lower(input.theme, "en")} is about to redraw the rules.`,
    text: [
      `${input.protagonist} expected ${input.universe} to stay legible for one more night, but the first crack arrived early. It came wrapped in the language of ${lower(input.theme, "en")}, quiet enough to be denied and sharp enough to leave a mark.`,
      `What follows is not a demo premise but the opening move of a living story system: a world with continuity, pressure, and choices that can widen or collapse the path ahead. The tone stays ${lower(input.tone, "en")}, the genre stays ${lower(input.genre, "en")}, and the next decision already matters.`,
      `By the time the moment settles, there are only a few credible directions left. None of them are safe, and each would force a different version of the story to surface.`,
    ].join("\n\n"),
    choices,
  };
}

function createNextBeat(input: ApplyChoiceRequest) {
  if (input.story.contentLanguage === "ru") {
    return `${input.story.theme} сталкивается с неожиданным свидетелем`;
  }

  return `${input.story.theme} collides with an unexpected witness`;
}

function createNextChoices(
  chapterNumber: number,
  request: GenerateNextChapterRequest,
) {
  if (request.story.contentLanguage === "ru") {
    return makeChoices(chapterNumber, [
      {
        label: `Сделать ставку на ${lower(request.transition.nextBeat, "ru")}`,
        outcomeHint: "Ускорить центральную линию и ещё сильнее поднять ставки.",
      },
      {
        label: `Проверить пределы ${lower(request.story.theme, "ru")}`,
        outcomeHint: "Прощупать скрытые правила мира и найти противоречия.",
      },
      {
        label: `Защитить ${request.story.protagonist} от последствий`,
        outcomeHint: "Стабилизировать ситуацию, прежде чем идти на новый риск.",
      },
    ]);
  }

  return makeChoices(chapterNumber, [
    {
      label: `Lean into ${lower(request.transition.nextBeat, "en")}`,
      outcomeHint: "Accelerate the central thread and raise the stakes.",
    },
    {
      label: `Test the limits of ${lower(request.story.theme, "en")}`,
      outcomeHint: "Probe the world for hidden rules or contradictions.",
    },
    {
      label: `Protect ${request.story.protagonist} from the fallout`,
      outcomeHint: "Stabilize the situation before taking the next risk.",
    },
  ]);
}

function createAppliedChoiceResult(
  input: ApplyChoiceRequest,
): AppliedChoiceResult {
  const choiceLabel = input.selectedChoice.label;
  const nextBeat = createNextBeat(input);

  if (input.story.contentLanguage === "ru") {
    return {
      resolutionSummary: `${input.story.protagonist} выбирает вариант "${choiceLabel}", и история смещается к более опасному проявлению темы ${lower(input.story.theme, "ru")}.`,
      updatedState: {
        summary: `${input.story.protagonist} делает ставку на "${choiceLabel}", и мир вокруг начинает реагировать так, будто времени на осторожность больше не осталось.`,
        activeGoals: [
          `Пережить последствия выбора "${choiceLabel}".`,
          `Понять, как ${lower(input.story.theme, "ru")} меняет правила мира.`,
        ],
        unresolvedTensions: [
          "Цена этого решения ещё только начинает раскрываться.",
          "Кто-то в тени может вести ту же линию к своим целям.",
        ],
        knownFacts: [
          ...input.currentState.knownFacts.slice(-3),
          `Последний выбор: ${choiceLabel}`,
          `Следующий бит: ${nextBeat}`,
        ],
      },
      nextBeat,
      moodShift: `${input.story.tone} давление сгущается вокруг главы ${input.currentChapterNumber + 1}`,
    };
  }

  return {
    resolutionSummary: `${input.story.protagonist} chooses to "${choiceLabel}", pushing the story toward a more dangerous expression of ${lower(input.story.theme, "en")}.`,
    updatedState: {
      summary: `${input.story.protagonist} has committed to "${choiceLabel}", and the world now reacts as if hesitation is no longer available.`,
      activeGoals: [
        `Survive the consequences of "${choiceLabel}".`,
        `Track how ${lower(input.story.theme, "en")} is changing the rules.`,
      ],
      unresolvedTensions: [
        "The cost of the choice is still unfolding.",
        "Someone else may already be shaping the same thread from the shadows.",
      ],
      knownFacts: [
        ...input.currentState.knownFacts.slice(-3),
        `Latest choice: ${choiceLabel}`,
        `Next beat: ${nextBeat}`,
      ],
    },
    nextBeat,
    moodShift: `${input.story.tone} pressure tightening around chapter ${input.currentChapterNumber + 1}`,
  };
}

function createGeneratedChapter(
  request: GenerateNextChapterRequest,
  choices: GeneratedChoice[],
): GeneratedChapter {
  const chapterNumber = request.nextChapterNumber;

  if (request.story.contentLanguage === "ru") {
    return {
      provider: "MOCK",
      title: `Глава ${chapterNumber}: Цена движения`,
      summary: `${request.story.protagonist} входит в главу ${chapterNumber}, неся последствия последнего решения и более ясное понимание того, как развивается линия "${lower(request.transition.nextBeat, "ru")}".`,
      text: [
        `Глава ${chapterNumber} открывается на фоне последствий предыдущего выбора. ${request.story.protagonist} больше не может наблюдать с безопасной дистанции: история уже признала решение свершившимся фактом, а ${lower(request.transition.nextBeat, "ru")} начинает оформляться в прямое следствие.`,
        `Фокус сохраняется на непрерывности. ${request.previousChapterSummary} Этот прежний сигнал теперь собирается в более жёсткую драматическую линию и делает мир ${request.story.universe} уже, страннее и опаснее.`,
        `К финалу сцены давление снова смещается. Темп остаётся собранным, тон удерживается в поле ${lower(request.story.tone, "ru")}, а следующий набор вариантов требует уже не любопытства, а настоящей ставки.`,
      ].join("\n\n"),
      choices,
    };
  }

  return {
    provider: "MOCK",
    title: `Chapter ${chapterNumber}: The Cost of Motion`,
    summary: `${request.story.protagonist} enters chapter ${chapterNumber} carrying the fallout of the last decision and a clearer view of ${lower(request.transition.nextBeat, "en")}.`,
    text: [
      `Chapter ${chapterNumber} opens with the residue of the previous move still in the air. ${request.story.protagonist} is no longer reacting from a safe distance; the story now treats the choice as a public fact, and ${lower(request.transition.nextBeat, "en")} starts to harden into consequence.`,
      `The chapter keeps the focus on continuity. ${request.previousChapterSummary} That earlier signal now feeds a stronger dramatic line, turning the world of ${request.story.universe} into something narrower, stranger, and harder to walk away from.`,
      `By the end of the scene, the pressure has shifted again. The pacing stays deliberate, the tone stays ${lower(request.story.tone, "en")}, and the next set of options is less about curiosity than commitment.`,
    ].join("\n\n"),
    choices,
  };
}

export class MockStoryGenerationProvider implements StoryGenerationProvider {
  key = "mock" as const;
  promptVersion = "mock-v2-localized";

  async generateInitialStory(
    input: InitialStoryRequest,
  ): Promise<GeneratedInitialStory> {
    const choices = createInitialChoices(input);

    return {
      title: input.title,
      synopsis: input.synopsis,
      provider: "MOCK",
      promptVersion: this.promptVersion,
      initialState: createInitialState(input),
      firstChapter: createFirstChapter(input, choices),
    };
  }

  async applyChoice(input: ApplyChoiceRequest): Promise<AppliedChoiceResult> {
    return createAppliedChoiceResult(input);
  }

  async generateNextChapter(
    request: GenerateNextChapterRequest,
  ): Promise<GeneratedChapter> {
    const choices = createNextChoices(request.nextChapterNumber, request);
    return createGeneratedChapter(request, choices);
  }
}
