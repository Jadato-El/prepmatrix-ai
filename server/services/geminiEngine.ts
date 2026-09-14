import axios from 'axios';
import { DifficultyLevel, Flashcard, QuizQuestion } from '../../src/types/index.js';

export interface GenerateGeminiParams {
  apiKey: string;
  model?: string;
  content: string;
  format: 'flashcards' | 'quiz' | 'exam';
  count: number;
  difficulty: DifficultyLevel | 'mixed';
  focusTopics?: string;
}

const DEFAULT_MODEL = 'gemini-2.5-flash';

/**
 * Clean and parse JSON response from LLM, handling markdown code fences
 */
function extractJsonFromText(rawText: string): any {
  let cleaned = rawText.trim();
  // Remove markdown json fences ```json ... ```
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

export async function callGeminiApi(
  apiKey: string,
  modelName: string,
  systemInstruction: string,
  userPrompt: string
): Promise<any> {
  const model = modelName || DEFAULT_MODEL;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload = {
    system_instruction: {
      parts: [{ text: systemInstruction }],
    },
    contents: [
      {
        parts: [{ text: userPrompt }],
      },
    ],
    generationConfig: {
      temperature: 0.2, // Low temperature for high academic precision and factual adherence
      responseMimeType: 'application/json',
    },
  };

  const response = await axios.post(endpoint, payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 60000,
  });

  const candidate = response.data?.candidates?.[0];
  if (!candidate || !candidate.content?.parts?.[0]?.text) {
    throw new Error('Gemini API returned an empty or invalid response.');
  }

  const outputText = candidate.content.parts[0].text;
  return extractJsonFromText(outputText);
}

export async function generateFlashcardsWithGemini(params: GenerateGeminiParams): Promise<Flashcard[]> {
  const { apiKey, model = DEFAULT_MODEL, content, count, difficulty, focusTopics } = params;

  const systemInstruction = `You are an elite academic professor and expert curriculum designer specializing in active recall and spaced repetition flashcards.
Your goal is to extract high-yield knowledge from the provided text and produce high-standard flashcards.

DIFFICULTY GUIDELINES (Bloom's Taxonomy):
- 'easy' (Foundational): High-accuracy recall of core terms, foundational definitions, essential relationships, and key formulas. No trivial or vague trivia.
- 'medium' (Applied): Application of concepts to realistic scenarios, diagnostic examples, mechanism breakdowns, and comparative analysis.
- 'hard' (Advanced & Synthesis): Multi-concept integration, boundary conditions, edge cases, trade-off analysis, and high-level evaluation.

Return ONLY a valid JSON array of objects with this exact structure:
[
  {
    "front": "Clear, precise academic prompt or question (avoid single-word prompts)",
    "back": "Authoritative, thorough answer with key distinctions highlighted",
    "hint": "Subtle conceptual clue that prompts active retrieval without giving away the answer",
    "difficulty": "easy" | "medium" | "hard",
    "tags": ["Topic1", "Topic2"],
    "sourceCitation": "Direct phrase or sentence from the source context supporting this card"
  }
]`;

  const userPrompt = `Generate exactly ${count} high-quality flashcards based STRICTLY on the following source material.
Difficulty requested: ${difficulty === 'mixed' ? 'A balanced mix of easy, medium, and hard' : difficulty}.
${focusTopics ? `Prioritize these focal topics: ${focusTopics}` : ''}

SOURCE TEXT:
${content.slice(0, 30000)}`;

  const rawCards = await callGeminiApi(apiKey, model, systemInstruction, userPrompt);
  if (!Array.isArray(rawCards)) {
    throw new Error('Expected JSON array of flashcards from Gemini.');
  }

  return rawCards.map((card: any, idx: number) => ({
    id: `fc-${Date.now()}-${idx + 1}`,
    front: card.front || 'Concept Prompt',
    back: card.back || 'Detailed Explanation',
    hint: card.hint || 'Think about the core principle.',
    difficulty: (['easy', 'medium', 'hard'].includes(card.difficulty) ? card.difficulty : 'medium') as DifficultyLevel,
    tags: Array.isArray(card.tags) && card.tags.length ? card.tags : ['General'],
    leitnerBox: 1,
    sourceCitation: card.sourceCitation || 'From source material',
  }));
}

export async function generateQuestionsWithGemini(params: GenerateGeminiParams): Promise<QuizQuestion[]> {
  const { apiKey, model = DEFAULT_MODEL, content, count, difficulty, focusTopics } = params;

  const systemInstruction = `You are a world-class psychometrician and chief exam writer for high-stakes professional certifications (USMLE, Bar Exam, CFA, AWS Certified Solutions Architect, GRE).
You create multiple-choice questions of the HIGHEST ACADEMIC AND RIGOROUS STANDARDS.

QUALITY REQUIREMENTS:
1. Plausible Distractors: Every incorrect option must represent a genuine, prevalent cognitive misconception, partial truth, or common student trap. NEVER include silly, obviously flawed, or filler distractors.
2. Parallel Structure: All 4 options must be approximately equal in length, grammatical structure, and complexity so the test-taker cannot guess based on formatting.
3. No Clues: Avoid "all of the above", "none of the above", or extreme qualifiers ("always", "never") unless conceptually necessary.
4. Comprehensive Explanations: You MUST provide an explanation array of exactly 4 strings, explicitly addressing why Option 0, Option 1, Option 2, and Option 3 is either correct or why it is an attractive distractor and what misconception it represents.
5. Difficulty Levels:
   - 'easy': Foundational principles, direct causality, unambiguous definitions.
   - 'medium': Applied scenarios, multi-variable case analysis, troubleshooting.
   - 'hard': Advanced synthesis, subtle differential diagnosis, edge conditions, high-stakes trade-offs.

Return ONLY a valid JSON array of objects with this exact structure:
[
  {
    "question": "Vivid, unambiguous question stem presenting a clear problem or inquiry",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0, // integer 0, 1, 2, or 3
    "explanations": [
      "Why Option A is correct/incorrect and the precise reasoning.",
      "Why Option B is correct/incorrect and the precise reasoning.",
      "Why Option C is correct/incorrect and the precise reasoning.",
      "Why Option D is correct/incorrect and the precise reasoning."
    ],
    "difficulty": "easy" | "medium" | "hard",
    "conceptTested": "The core theorem, law, or mechanism being assessed",
    "sourceCitation": "Relevant excerpt from the provided text"
  }
]`;

  const userPrompt = `Generate exactly ${count} rigorous questions based STRICTLY on the following source material.
Difficulty requested: ${difficulty === 'mixed' ? 'A calibrated mix of easy (30%), medium (40%), and hard (30%)' : difficulty}.
${focusTopics ? `Specific focus areas: ${focusTopics}` : ''}

SOURCE TEXT:
${content.slice(0, 30000)}`;

  const rawQuestions = await callGeminiApi(apiKey, model, systemInstruction, userPrompt);
  if (!Array.isArray(rawQuestions)) {
    throw new Error('Expected JSON array of questions from Gemini.');
  }

  return rawQuestions.map((q: any, idx: number) => ({
    id: `q-${Date.now()}-${idx + 1}`,
    question: q.question || 'Exam Question',
    options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
    correctIndex: typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex <= 3 ? q.correctIndex : 0,
    explanations: Array.isArray(q.explanations) && q.explanations.length === 4
      ? q.explanations
      : [
          'Option A analysis.',
          'Option B analysis.',
          'Option C analysis.',
          'Option D analysis.'
        ],
    difficulty: (['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium') as DifficultyLevel,
    conceptTested: q.conceptTested || 'Conceptual Knowledge',
    sourceCitation: q.sourceCitation || 'From source text',
  }));
}
