import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { scrapeUrl } from './services/scraper.js';
import { parseDocumentFile } from './services/docParser.js';
import { generateFlashcardsWithGemini, generateQuestionsWithGemini } from './services/geminiEngine.js';
import { generateFallbackFlashcards, generateFallbackQuestions } from './services/fallbackEngine.js';
import { DocumentSource, Exam, Flashcard, QuizQuestion } from '../src/types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer in-memory upload storage for files (PDF, DOCX, TXT, MD)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB max per file
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), app: 'PrepMatrix AI Server' });
});

// Verify Gemini API Key
app.post('/api/verify-gemini-key', async (req, res) => {
  const { apiKey, model = 'gemini-2.5-flash' } = req.body;
  if (!apiKey) {
    return res.status(400).json({ valid: false, error: 'API key is required' });
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const testResponse = await axios.post(
      endpoint,
      {
        contents: [{ parts: [{ text: 'Respond with the word "OK"' }] }],
        generationConfig: { maxOutputTokens: 5 },
      },
      { timeout: 10000 }
    );

    if (testResponse.status === 200) {
      return res.json({ valid: true, message: 'Google Gemini API key verified successfully.' });
    } else {
      return res.status(400).json({ valid: false, error: 'API key verification failed.' });
    }
  } catch (err: any) {
    const message = err.response?.data?.error?.message || err.message || 'Verification error';
    return res.status(400).json({ valid: false, error: message });
  }
});

// Ingest URL
app.post('/api/ingest/url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required.' });
    }

    const scraped = await scrapeUrl(url);
    const doc: DocumentSource = {
      id: `doc-url-${Date.now()}`,
      title: scraped.title,
      type: 'url',
      content: scraped.content,
      excerpt: scraped.excerpt,
      wordCount: scraped.wordCount,
      url: scraped.url,
      createdAt: new Date().toISOString(),
      tags: ['Web Article'],
    };

    res.json({ document: doc });
  } catch (err: any) {
    console.error('Error scraping URL:', err);
    res.status(500).json({ error: err.message || 'Failed to scrape URL.' });
  }
});

// Ingest Files (PDF, DOCX, TXT, MD)
app.post('/api/ingest/file', upload.array('files', 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded.' });
    }

    const documents: DocumentSource[] = [];

    for (const file of files) {
      const parsed = await parseDocumentFile(file.originalname, file.buffer);
      documents.push({
        id: `doc-file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: parsed.title,
        type: parsed.type,
        content: parsed.content,
        excerpt: parsed.excerpt,
        wordCount: parsed.wordCount,
        fileName: file.originalname,
        createdAt: new Date().toISOString(),
        tags: [parsed.type.toUpperCase()],
      });
    }

    res.json({ documents });
  } catch (err: any) {
    console.error('Error parsing files:', err);
    res.status(500).json({ error: err.message || 'Failed to parse file.' });
  }
});

// Ingest Direct Text / Notes
app.post('/api/ingest/text', async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required.' });
    }

    const cleanContent = content.trim();
    const cleanTitle = (title && title.trim()) || 'Custom Notes';
    const words = cleanContent.split(/\s+/).filter(Boolean);

    const doc: DocumentSource = {
      id: `doc-txt-${Date.now()}`,
      title: cleanTitle,
      type: 'text',
      content: cleanContent,
      excerpt: cleanContent.slice(0, 240) + (cleanContent.length > 240 ? '...' : ''),
      wordCount: words.length,
      createdAt: new Date().toISOString(),
      tags: ['Manual Notes'],
    };

    res.json({ document: doc });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save note.' });
  }
});

// Generate Flashcards
app.post('/api/generate/flashcards', async (req, res) => {
  try {
    const { apiKey, model, content, count = 8, difficulty = 'mixed', focusTopics } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required for flashcard generation.' });
    }

    const targetKey = apiKey || process.env.GEMINI_API_KEY;

    if (targetKey) {
      try {
        const flashcards = await generateFlashcardsWithGemini({
          apiKey: targetKey,
          model,
          content,
          format: 'flashcards',
          count: Number(count),
          difficulty,
          focusTopics,
        });
        return res.json({ flashcards, source: 'gemini' });
      } catch (geminiErr: any) {
        console.warn('Gemini API call failed, falling back to local academic engine:', geminiErr.message);
      }
    }

    // Fallback generation
    const flashcards = generateFallbackFlashcards(content, Number(count), difficulty);
    return res.json({ flashcards, source: 'fallback' });
  } catch (err: any) {
    console.error('Error generating flashcards:', err);
    res.status(500).json({ error: err.message || 'Failed to generate flashcards.' });
  }
});

// Generate Quiz
app.post('/api/generate/quiz', async (req, res) => {
  try {
    const { apiKey, model, content, count = 6, difficulty = 'mixed', focusTopics } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required for quiz generation.' });
    }

    const targetKey = apiKey || process.env.GEMINI_API_KEY;

    if (targetKey) {
      try {
        const questions = await generateQuestionsWithGemini({
          apiKey: targetKey,
          model,
          content,
          format: 'quiz',
          count: Number(count),
          difficulty,
          focusTopics,
        });
        return res.json({ questions, source: 'gemini' });
      } catch (geminiErr: any) {
        console.warn('Gemini API call failed, falling back to local academic engine:', geminiErr.message);
      }
    }

    // Fallback generation
    const questions = generateFallbackQuestions(content, Number(count), difficulty);
    return res.json({ questions, source: 'fallback' });
  } catch (err: any) {
    console.error('Error generating quiz:', err);
    res.status(500).json({ error: err.message || 'Failed to generate quiz.' });
  }
});

// Generate Full Practice Exam
app.post('/api/generate/exam', async (req, res) => {
  try {
    const {
      apiKey,
      model,
      content,
      count = 10,
      difficulty = 'mixed',
      title = 'Comprehensive Practice Examination',
      description = 'Timed evaluation testing foundational knowledge, real-world application, and synthesis.',
      timeLimitMinutes = 15,
      sourceDocIds = [],
    } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required for exam generation.' });
    }

    const targetKey = apiKey || process.env.GEMINI_API_KEY;
    let questions: QuizQuestion[] = [];
    let source: 'gemini' | 'fallback' = 'fallback';

    if (targetKey) {
      try {
        questions = await generateQuestionsWithGemini({
          apiKey: targetKey,
          model,
          content,
          format: 'exam',
          count: Number(count),
          difficulty,
        });
        source = 'gemini';
      } catch (geminiErr: any) {
        console.warn('Gemini API call failed, generating practice exam via fallback:', geminiErr.message);
      }
    }

    if (!questions.length) {
      questions = generateFallbackQuestions(content, Number(count), difficulty);
    }

    const exam: Exam = {
      id: `exam-${Date.now()}`,
      title,
      description,
      timeLimitMinutes: Number(timeLimitMinutes) || Math.ceil(questions.length * 1.5),
      passingPercentage: 70,
      questions,
      sourceDocIds,
      createdAt: new Date().toISOString(),
    };

    return res.json({ exam, source });
  } catch (err: any) {
    console.error('Error generating exam:', err);
    res.status(500).json({ error: err.message || 'Failed to generate exam.' });
  }
});

// In production standalone node, serve the built Vite frontend
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('/*splat', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

export default app;
export { app };