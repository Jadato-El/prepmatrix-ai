# PrepMatrix AI — Intelligent Study & Exam Generation Platform

A full-stack, academically rigorous study platform that ingests documents (PDF, DOCX, TXT, MD) and live website links to generate high-quality Flashcards, Interactive Quizzes, and Timed Practice Exams across 3 difficulty tiers based on Bloom's Taxonomy.

## ✨ Features

- **Multi-Source Ingestion**:
  - Live Web URL scraper (automatically strips ads and noise)
  - PDF, DOCX, TXT, and Markdown parser
  - Direct lecture notes & textbook excerpt pasting
  - Document library with multi-source selection
- **High-Standard Question Generation**:
  - Direct integration with Google Gemini (`gemini-2.5-flash`, `gemini-1.5-pro`)
  - 3-tier Bloom's Taxonomy calibration:
    - **Level 1 (Easy / Foundational)**: Definitions & core principles
    - **Level 2 (Medium / Applied)**: Diagnostic scenarios & practical problem-solving
    - **Level 3 (Hard / Advanced Synthesis)**: Certification-level rigor (USMLE / Bar / GRE style) with plausible distractors
  - 4-way option analysis explaining why each distractor is wrong
  - Smart offline fallback engine with seeded academic study sets
- **Interactive Study Modules**:
  - **3D Flashcards**: Flip animations, Spaced Repetition (Leitner 4-level system), Text-to-Speech audio, keyboard shortcuts (`Space`, arrows, `1-4`), and Anki/TSV export
  - **Interactive Quiz**: Instant feedback, option rationales, streak counter, and "Retry Missed Questions" mode
  - **Simulated Practice Exam**: Timed countdown, question navigator grid, flag-for-review, submit warnings, in-depth diagnostic scorecard, and printable exam sheets with answer keys
  - **Mastery Analytics**: Difficulty breakdown charts, historical exam logs, and curriculum recommendations

## 🚀 Running the Project

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start both server and client:
   ```bash
   npm run dev
   ```

3. Open your browser at:
   ```
   http://localhost:5173
   ```
