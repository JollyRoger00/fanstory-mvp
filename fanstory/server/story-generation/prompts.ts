import type {
  ApplyChoiceRequest,
  GenerateNextChapterRequest,
  InitialStoryRequest,
} from "@/server/story-generation/types";

function getLanguageLabel(contentLanguage: "en" | "ru") {
  return contentLanguage === "ru" ? "Russian" : "English";
}

function getLanguageDirective(contentLanguage: "en" | "ru") {
  if (contentLanguage === "ru") {
    return [
      "Write every narrative field in Russian using natural Cyrillic.",
      "Do not mix English filler sentences into Russian output.",
      "Keep proper nouns like Warhammer 40k unchanged unless Russian inflection is genuinely natural.",
    ].join(" ");
  }

  return [
    "Write every narrative field in English.",
    "Do not switch into Russian or any other language.",
    "Keep proper nouns and setting names exactly as provided.",
  ].join(" ");
}

function stringifyContext(value: unknown) {
  return JSON.stringify(value, null, 2);
}

const globalNarrativeRules = [
  "You are the FanStory narrative engine for an interactive branching fiction product.",
  "Return only structured data that matches the supplied schema.",
  "Never return markdown fences, commentary, explanations, or schema labels.",
  "Maintain continuity and causal consistency.",
  "Avoid generic AI phrasing, writing advice, or meta references to prompts, models, or game systems.",
  "Chapter prose must end at a tense decision point that makes the upcoming choices meaningful.",
  "Choice labels must be materially different, mutually exclusive, and immediately actionable.",
  "Outcome hints must foreshadow consequences without spoiling the next chapter.",
  "State fields must describe the actual evolving story world, not abstract writing goals.",
].join(" ");

export function buildInitialStoryPrompt(input: InitialStoryRequest) {
  const instructions = [
    globalNarrativeRules,
    getLanguageDirective(input.contentLanguage),
    "You are generating the opening package for a new story.",
    "Respect the user-provided title as the canonical title of the story.",
    "Produce a polished synopsis, a coherent initial state snapshot, a strong first chapter, and exactly three branching choices.",
    "The opening chapter should establish the protagonist, the central instability, and a concrete source of pressure.",
    "The chapter should feel publication-ready rather than like an outline.",
  ].join(" ");

  const userPrompt = [
    `Story language: ${getLanguageLabel(input.contentLanguage)}`,
    "Create the opening story package from this configuration:",
    stringifyContext({
      title: input.title,
      synopsis: input.synopsis,
      universe: input.universe,
      protagonist: input.protagonist,
      theme: input.theme,
      genre: input.genre,
      tone: input.tone,
    }),
    "Requirements:",
    "- Keep the user title unchanged conceptually and build around it.",
    "- Synopsis should be concise, high-signal, and suitable for a story detail card.",
    "- initialState.summary should explain the current situation in 1-2 sentences.",
    "- activeGoals, unresolvedTensions, and knownFacts should be concrete story truths.",
    "- firstChapter.text should be immersive prose with multiple paragraphs.",
    "- End the chapter at a real branching moment.",
  ].join("\n\n");

  return {
    instructions,
    userPrompt,
  };
}

export function buildApplyChoicePrompt(input: ApplyChoiceRequest) {
  const instructions = [
    globalNarrativeRules,
    getLanguageDirective(input.story.contentLanguage),
    "You are resolving a player's selected choice in an ongoing story.",
    "Do not generate the next chapter yet.",
    "Resolve the choice, update the state snapshot, and describe the next dramatic beat.",
    "The updated state must preserve continuity from prior facts while reflecting the consequence of the chosen action.",
  ].join(" ");

  const userPrompt = [
    `Story language: ${getLanguageLabel(input.story.contentLanguage)}`,
    "Resolve the selected choice using this context:",
    stringifyContext({
      story: input.story,
      currentChapterNumber: input.currentChapterNumber,
      currentState: input.currentState,
      selectedChoice: input.selectedChoice,
      choiceHistory: input.choiceHistory,
    }),
    "Requirements:",
    "- resolutionSummary should explain what the choice changes right now.",
    "- updatedState.summary should reflect the new immediate situation.",
    "- nextBeat should be a compact description of the next scene-driving development.",
    "- moodShift should capture the emotional or tonal turn created by the choice.",
    "- knownFacts may add new truths, but should not contradict established facts.",
  ].join("\n\n");

  return {
    instructions,
    userPrompt,
  };
}

export function buildNextChapterPrompt(request: GenerateNextChapterRequest) {
  const instructions = [
    globalNarrativeRules,
    getLanguageDirective(request.story.contentLanguage),
    "You are generating the next chapter of an existing interactive story.",
    "Continue directly from the established transition and preserve narrative continuity.",
    "Write a strong chapter rather than an outline, then end on a branching point with exactly three choices.",
  ].join(" ");

  const userPrompt = [
    `Story language: ${getLanguageLabel(request.story.contentLanguage)}`,
    "Generate the next chapter from this context:",
    stringifyContext({
      story: request.story,
      nextChapterNumber: request.nextChapterNumber,
      previousChapterSummary: request.previousChapterSummary,
      transition: request.transition,
    }),
    "Requirements:",
    "- Chapter title should feel specific to the current story beat.",
    "- summary should capture the chapter's movement and consequence.",
    "- text should be immersive prose with multiple paragraphs and concrete progression.",
    "- Choices must emerge naturally from the end of the chapter.",
    "- Each choice should imply a clearly different direction for the next scene.",
  ].join("\n\n");

  return {
    instructions,
    userPrompt,
  };
}
