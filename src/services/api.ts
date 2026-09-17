import axios from 'axios';
import { DocumentSource, Exam, Flashcard, GenerationOptions, QuizQuestion } from '../types/index.js';

const API_BASE = '/api';

export const ApiService = {
  async healthCheck(): Promise<boolean> {
    try {
      const res = await axios.get(`${API_BASE}/health`, { timeout: 4000 });
      return res.data?.status === 'ok';
    } catch {
      return false;
    }
  },

  async verifyGeminiKey(apiKey: string, model: string = 'gemini-3.6-flash'): Promise<{ valid: boolean; error?: string }> {
    try {
      const res = await axios.post(`${API_BASE}/verify-gemini-key`, { apiKey, model });
      return { valid: res.data?.valid === true };
    } catch (err: any) {
      return {
        valid: false,
        error: err.response?.data?.error || err.message || 'Verification failed',
      };
    }
  },

  async ingestUrl(url: string): Promise<DocumentSource> {
    const res = await axios.post(`${API_BASE}/ingest/url`, { url });
    return res.data.document;
  },

  async ingestFiles(files: File[]): Promise<DocumentSource[]> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }
    const res = await axios.post(`${API_BASE}/ingest/file`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.documents;
  },

  async ingestText(title: string, content: string): Promise<DocumentSource> {
    const res = await axios.post(`${API_BASE}/ingest/text`, { title, content });
    return res.data.document;
  },

  async generateFlashcards(
    content: string,
    options: Partial<GenerationOptions>,
    apiKey?: string,
    model?: string
  ): Promise<{ flashcards: Flashcard[]; source: string }> {
    const res = await axios.post(`${API_BASE}/generate/flashcards`, {
      content,
      count: options.count || 8,
      difficulty: options.difficulty || 'mixed',
      focusTopics: options.focusTopics,
      apiKey,
      model,
    });
    return res.data;
  },

  async generateQuiz(
    content: string,
    options: Partial<GenerationOptions>,
    apiKey?: string,
    model?: string
  ): Promise<{ questions: QuizQuestion[]; source: string }> {
    const res = await axios.post(`${API_BASE}/generate/quiz`, {
      content,
      count: options.count || 6,
      difficulty: options.difficulty || 'mixed',
      focusTopics: options.focusTopics,
      apiKey,
      model,
    });
    return res.data;
  },

  async generateExam(
    content: string,
    options: Partial<GenerationOptions>,
    title?: string,
    timeLimitMinutes?: number,
    sourceDocIds: string[] = [],
    apiKey?: string,
    model?: string
  ): Promise<{ exam: Exam; source: string }> {
    const res = await axios.post(`${API_BASE}/generate/exam`, {
      content,
      count: options.count || 10,
      difficulty: options.difficulty || 'mixed',
      title: title || 'Comprehensive Practice Examination',
      timeLimitMinutes: timeLimitMinutes || 15,
      sourceDocIds,
      apiKey,
      model,
    });
    return res.data;
  },
};
