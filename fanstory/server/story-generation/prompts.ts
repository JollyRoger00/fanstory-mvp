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
  "Use commercial novel craft rather than improvisational filler: setup, escalation, reversals, consequences, payoff.",
  "Avoid generic AI phrasing, writing advice, or meta references to prompts, models, or game systems.",
  "Each paragraph must add new action, information, or escalation rather than restating the same beat.",
  "Every chapter must create concrete movement in the story world; by the end, the situation must be materially different from where it started.",
  "Avoid static stand-offs, circular introspection, and chapters where the protagonist stays in one emotional or tactical loop.",
  "Treat every user choice as a meaningful branch pressure that changes at least one persistent axis: trust, knowledge, risk, resources, leverage, position, or moral cost.",
  "Chapter prose must end at a tense decision point that makes the upcoming choices meaningful.",
  "Choice labels must be materially different, mutually exclusive, and immediately actionable.",
  "Use story-specific people, places, objects, factions, and tactics in the choices whenever possible.",
  "Do not fall back to generic option sets that merely restate attack, ask for help, or retreat without concrete context.",
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
    "Design the story to sustain 30-50 chapters with progressive escalation and real payoff.",
    "Build a long-form plan that follows book structure: opening disturbance, progressive complications, midpoint reversal, crisis, climax, aftermath.",
    "The opening chapter should establish the protagonist, the central instability, and a concrete source of pressure.",
    "The opening chapter must move through at least three beats: disturbance, complication, and an irreversible turn.",
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
    "- storyPlan.targetChapterCount must be between 30 and 50.",
    "- storyPlan should create a viable long arc with four phases, several major turns, persistent story threads, and three plausible end directions.",
    "- storyPlan.choiceAxes should define the persistent dimensions that user choices can truly alter across the book.",
    "- initialState.summary should explain the current situation in 1-2 sentences.",
    "- activeGoals, unresolvedTensions, and knownFacts should be concrete story truths.",
    "- firstChapter.text should feel like a 5-10 minute read: substantial, immersive, and not compressed into a short scene.",
    "- firstChapter.text should be immersive prose with at least six paragraphs and visible progression.",
    "- Each paragraph should add fresh action, information, or escalation rather than paraphrasing the same danger.",
    "- Within the chapter, reveal at least one concrete fact and force the protagonist into a changed immediate situation.",
    "- End the chapter at a real branching moment.",
    "- The three opening choices must alter the situation in different ways, not just reskin the same move.",
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
    "Treat the selected choice as an irreversible commitment that changes the immediate plan on the ground.",
    "The consequence must create new pressure rather than merely repeating the same conflict with stronger wording.",
    "Honor the long-form story plan and the current book phase while preserving freedom for branching consequences.",
    "The updated state must preserve continuity from prior facts while reflecting the consequence of the chosen action.",
  ].join(" ");

  const userPrompt = [
    `Story language: ${getLanguageLabel(input.story.contentLanguage)}`,
    "Resolve the selected choice using this context:",
    stringifyContext({
      story: input.story,
      storyPlan: input.storyPlan,
      storyProgress: input.storyProgress,
      currentChapterNumber: input.currentChapterNumber,
      currentState: input.currentState,
      selectedChoice: input.selectedChoice,
      recentChapters: input.recentChapters,
      choiceHistory: input.choiceHistory,
    }),
    "Requirements:",
    "- resolutionSummary should explain what tangibly changes right now.",
    "- updatedState.summary should reflect a changed tactical, relational, or informational situation.",
    "- nextBeat should be a compact but concrete description of the next scene-driving development involving a person, place, object, discovery, or threat response.",
    "- moodShift should capture a specific tonal turn created by the choice, not a generic statement that tension rises.",
    "- The choice must alter at least one persistent axis from storyPlan.choiceAxes.",
    "- The updated state should preserve consequences that matter later instead of resetting the story back to neutral.",
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
    "Honor the long-form story plan and the current phase of the book.",
    "The chapter must contain at least three distinct beats: immediate fallout, complication or discovery, and an irreversible turn.",
    "By the end of the chapter, at least one of these must have changed: location, objective, relationship, revealed information, or threat balance.",
    "Avoid chapters that spend their full length in a static standoff, repeated introspection, or a single unchanged moment.",
    "Do not spend climax-level resolution too early; preserve payoffs for the later planned turning points unless the branch logic clearly earns an early break.",
    "Write a strong chapter rather than an outline, then end on a branching point with exactly three choices.",
  ].join(" ");

  const userPrompt = [
    `Story language: ${getLanguageLabel(request.story.contentLanguage)}`,
    "Generate the next chapter from this context:",
    stringifyContext({
      story: request.story,
      storyPlan: request.storyPlan,
      storyProgress: request.storyProgress,
      nextChapterNumber: request.nextChapterNumber,
      previousChapterSummary: request.previousChapterSummary,
      recentChapters: request.recentChapters,
      choiceHistory: request.choiceHistory,
      transition: request.transition,
    }),
    "Requirements:",
    "- Chapter title should feel specific to the current story beat.",
    "- summary should capture the chapter's movement and consequence.",
    "- text should feel like a 5-10 minute read and carry real dramatic weight.",
    "- text should be immersive prose with at least six paragraphs and concrete progression.",
    "- Open with consequence already in motion rather than a recap of the previous dilemma.",
    "- Each paragraph should introduce fresh action, information, or escalation.",
    "- The chapter must advance at least one persistent thread from storyPlan.persistentThreads.",
    "- The chapter should perform the structural work implied by storyProgress.currentPhase and storyProgress.phasePurpose.",
    "- The chapter should include a concrete reveal, setback, or cost created by the previous choice.",
    "- Choices must emerge naturally from the end of the chapter.",
    "- Each choice should imply a clearly different direction for the next scene.",
    "- Each choice must change at least one axis from storyPlan.choiceAxes in a different way.",
    "- Choices should be scene-specific and should not merely restate generic fight, seek-help, or retreat options unless grounded in a specific tactic, ally, destination, or object.",
  ].join("\n\n");

  return {
    instructions,
    userPrompt,
  };
}
