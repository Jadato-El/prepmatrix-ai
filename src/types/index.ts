export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface DocumentSource {
  id: string;
  title: string;
  type: 'url' | 'pdf' | 'docx' | 'text';
  content: string;
  excerpt: string;
  wordCount: number;
  url?: string;
  fileName?: string;
  createdAt: string;
  tags?: string[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint: string;
  difficulty: DifficultyLevel;
  tags: string[];
  leitnerBox: 1 | 2 | 3 | 4; // 1 = Review soon, 4 = Mastered
  lastReviewed?: string;
  nextReview?: string;
  sourceCitation?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanations: string[]; // Rationale for why EACH option is right or wrong
  difficulty: DifficultyLevel;
  conceptTested: string;
  sourceCitation?: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  subject?: string;
  timeLimitMinutes: number;
  passingPercentage: number;
  questions: QuizQuestion[];
  sourceDocIds: string[];
  createdAt: string;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  examTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds: number;
  completedAt: string;
  userAnswers: Record<string, number>; // questionId -> selected option index
  flaggedQuestionIds: string[];
  difficultyBreakdown: {
    easy: { correct: number; total: number };
    medium: { correct: number; total: number };
    hard: { correct: number; total: number };
  };
}

export interface UserSettings {
  geminiApiKey: string;
  geminiModel: string;
  studyMode: 'all' | 'unmastered' | 'hard-only';
  soundEnabled: boolean;
  autoReadTTS: boolean;
}

export interface GenerationOptions {
  difficulty: DifficultyLevel | 'mixed';
  count: number;
  focusTopics?: string;
  documentIds: string[];
  targetFormat: 'flashcards' | 'quiz' | 'exam';
  examTimeMinutes?: number;
}
