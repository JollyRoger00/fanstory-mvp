import { slugify } from "@/lib/utils";
import type {
  AppliedChoiceResult,
  ApplyChoiceRequest,
  GeneratedChapter,
  GeneratedChoice,
  GeneratedInitialStory,
  GenerateNextChapterRequest,
  InitialStoryRequest,
  StoryGenerationProvider,
} from "@/server/story-generation/types";

function toChoiceKey(chapterNumber: number, label: string, position: number) {
  return `ch${chapterNumber}-${position + 1}-${slugify(label).slice(0, 24)}`;
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
      label: `Hide the discovery and study the pattern alone`,
      outcomeHint: "Stay secretive and gather leverage before moving.",
    },
  ]);
}

function createNextChoices(
  chapterNumber: number,
  request: GenerateNextChapterRequest,
) {
  return makeChoices(chapterNumber, [
    {
      label: `Lean into ${request.transition.nextBeat.toLowerCase()}`,
      outcomeHint: "Accelerate the central thread and raise the stakes.",
    },
    {
      label: `Test the limits of ${request.story.theme.toLowerCase()}`,
      outcomeHint: "Probe the world for hidden rules or contradictions.",
    },
    {
      label: `Protect ${request.story.protagonist.toLowerCase()} from the fallout`,
      outcomeHint: "Stabilize the situation before taking the next risk.",
    },
  ]);
}

export class MockStoryGenerationProvider implements StoryGenerationProvider {
  key = "mock" as const;
  promptVersion = "mock-v1";

  async generateInitialStory(
    input: InitialStoryRequest,
  ): Promise<GeneratedInitialStory> {
    const choices = createInitialChoices(input);

    return {
      title: input.title,
      synopsis: input.synopsis,
      provider: "MOCK",
      promptVersion: this.promptVersion,
      initialState: {
        summary: `${input.protagonist} has stepped into a volatile opening inside ${input.universe}, where ${input.theme.toLowerCase()} has become impossible to ignore.`,
        activeGoals: [
          `Understand why ${input.theme.toLowerCase()} matters now.`,
          `Keep narrative momentum aligned with a ${input.tone.toLowerCase()} tone.`,
        ],
        unresolvedTensions: [
          `${input.theme} is active but still poorly understood.`,
          `The protagonist does not yet know who can be trusted.`,
        ],
        knownFacts: [
          `Universe: ${input.universe}`,
          `Genre: ${input.genre}`,
          `Core promise: ${input.synopsis}`,
        ],
      },
      firstChapter: {
        title: "The First Fracture",
        summary: `${input.protagonist} notices the first irreversible sign that ${input.theme.toLowerCase()} is about to redraw the rules.`,
        text: [
          `${input.protagonist} expected ${input.universe} to stay legible for one more night, but the first crack arrived early. It came wrapped in the language of ${input.theme.toLowerCase()}, quiet enough to be denied and sharp enough to leave a mark.`,
          `What follows is not a demo premise but the opening move of a living story system: a world with continuity, pressure, and choices that can widen or collapse the path ahead. The tone stays ${input.tone.toLowerCase()}, the genre stays ${input.genre.toLowerCase()}, and the next decision already matters.`,
          `By the time the moment settles, there are only a few credible directions left. None of them are safe, and each would force a different version of the story to surface.`,
        ].join("\n\n"),
        choices,
      },
    };
  }

  async applyChoice(input: ApplyChoiceRequest): Promise<AppliedChoiceResult> {
    const choiceLabel = input.selectedChoice.label;
    const nextBeat = `${input.story.theme} collides with an unexpected witness`;
    const moodShift = `${input.story.tone} pressure tightening around chapter ${input.currentChapterNumber + 1}`;

    return {
      resolutionSummary: `${input.story.protagonist} chooses to "${choiceLabel}", pushing the story toward a more dangerous expression of ${input.story.theme.toLowerCase()}.`,
      updatedState: {
        summary: `${input.story.protagonist} has committed to "${choiceLabel}", and the world now reacts as if hesitation is no longer available.`,
        activeGoals: [
          `Survive the consequences of "${choiceLabel}".`,
          `Track how ${input.story.theme.toLowerCase()} is changing the rules.`,
        ],
        unresolvedTensions: [
          `The cost of the choice is still unfolding.`,
          `Someone else may already be shaping the same thread from the shadows.`,
        ],
        knownFacts: [
          ...input.currentState.knownFacts.slice(-3),
          `Latest choice: ${choiceLabel}`,
          `Next beat: ${nextBeat}`,
        ],
      },
      nextBeat,
      moodShift,
    };
  }

  async generateNextChapter(
    request: GenerateNextChapterRequest,
  ): Promise<GeneratedChapter> {
    const chapterNumber = request.nextChapterNumber;
    const choices = createNextChoices(chapterNumber, request);

    return {
      provider: "MOCK",
      title: `Chapter ${chapterNumber}: The Cost of Motion`,
      summary: `${request.story.protagonist} enters chapter ${chapterNumber} carrying the fallout of the last decision and a clearer view of ${request.transition.nextBeat.toLowerCase()}.`,
      text: [
        `Chapter ${chapterNumber} opens with the residue of the previous move still in the air. ${request.story.protagonist} is no longer reacting from a safe distance; the story now treats the choice as a public fact, and ${request.transition.nextBeat.toLowerCase()} starts to harden into consequence.`,
        `The chapter keeps the focus on continuity. ${request.previousChapterSummary} That earlier signal now feeds a stronger dramatic line, turning the world of ${request.story.universe} into something narrower, stranger, and harder to walk away from.`,
        `By the end of the scene, the pressure has shifted again. The pacing stays deliberate, the tone stays ${request.story.tone.toLowerCase()}, and the next set of options is less about curiosity than commitment.`,
      ].join("\n\n"),
      choices,
    };
  }
}
