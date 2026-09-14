import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  HelpCircle,
  GraduationCap,
  Loader2,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
} from 'lucide-react';
import { DifficultyLevel, DocumentSource, Exam, Flashcard, QuizQuestion, UserSettings } from '../../types/index.js';
import { ApiService } from '../../services/api.js';

interface GenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentSource[];
  selectedDocIds: string[];
  settings: UserSettings;
  onGeneratedFlashcards: (cards: Flashcard[]) => void;
  onGeneratedQuiz: (questions: QuizQuestion[]) => void;
  onGeneratedExam: (exam: Exam) => void;
  onNavigateToTab: (tab: 'flashcards' | 'quiz' | 'exam') => void;
}

export const GenerateModal: React.FC<GenerateModalProps> = ({
  isOpen,
  onClose,
  documents,
  selectedDocIds,
  settings,
  onGeneratedFlashcards,
  onGeneratedQuiz,
  onGeneratedExam,
  onNavigateToTab,
}) => {
  const [format, setFormat] = useState<'flashcards' | 'quiz' | 'exam'>('exam');
  const [difficulty, setDifficulty] = useState<DifficultyLevel | 'mixed'>('mixed');
  const [count, setCount] = useState<number>(6);
  const [examTimeLimit, setExamTimeLimit] = useState<number>(15);
  const [focusTopics, setFocusTopics] = useState<string>('');
  const [examTitle, setExamTitle] = useState<string>('Comprehensive Practice Examination');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Gather active document content
  const activeDocs =
    selectedDocIds.length > 0
      ? documents.filter((d) => selectedDocIds.includes(d.id))
      : documents;

  const combinedContent = activeDocs.map((d) => `### ${d.title}\n${d.content}`).join('\n\n');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!combinedContent.trim()) {
      setError('Please add or select at least one source document before generating.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (format === 'flashcards') {
        const res = await ApiService.generateFlashcards(
          combinedContent,
          { count, difficulty, focusTopics },
          settings.geminiApiKey,
          settings.geminiModel
        );
        onGeneratedFlashcards(res.flashcards);
        onNavigateToTab('flashcards');
      } else if (format === 'quiz') {
        const res = await ApiService.generateQuiz(
          combinedContent,
          { count, difficulty, focusTopics },
          settings.geminiApiKey,
          settings.geminiModel
        );
        onGeneratedQuiz(res.questions);
        onNavigateToTab('quiz');
      } else {
        const res = await ApiService.generateExam(
          combinedContent,
          { count, difficulty, focusTopics },
          examTitle,
          examTimeLimit,
          activeDocs.map((d) => d.id),
          settings.geminiApiKey,
          settings.geminiModel
        );
        onGeneratedExam(res.exam);
        onNavigateToTab('exam');
      }

      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Generation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Generate High-Standard Study Set</h3>
              <p className="text-xs text-slate-400">
                Calibrated across 3 Bloom's Taxonomy difficulty tiers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleGenerate} className="space-y-5">
          {/* Target Format Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Study Module
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setFormat('flashcards');
                  setCount(8);
                }}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  format === 'flashcards'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-md shadow-indigo-950/50'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Layers className="w-5 h-5 mx-auto mb-1 text-indigo-400" />
                <span className="text-xs font-semibold block">Flashcards</span>
                <span className="text-[10px] text-slate-500">Spaced recall</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormat('quiz');
                  setCount(6);
                }}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  format === 'quiz'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-md shadow-indigo-950/50'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <HelpCircle className="w-5 h-5 mx-auto mb-1 text-indigo-400" />
                <span className="text-xs font-semibold block">Interactive Quiz</span>
                <span className="text-[10px] text-slate-500">Instant feedback</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormat('exam');
                  setCount(10);
                }}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  format === 'exam'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-md shadow-indigo-950/50'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <GraduationCap className="w-5 h-5 mx-auto mb-1 text-indigo-400" />
                <span className="text-xs font-semibold block">Practice Exam</span>
                <span className="text-[10px] text-slate-500">Timed simulation</span>
              </button>
            </div>
          </div>

          {/* Difficulty Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Academic Difficulty Tier
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'mixed', label: 'Balanced Mix', desc: 'All 3 tiers' },
                { id: 'easy', label: 'Easy', desc: 'Foundational' },
                { id: 'medium', label: 'Medium', desc: 'Applied' },
                { id: 'hard', label: 'Hard', desc: 'Synthesis' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDifficulty(item.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                    difficulty === item.id
                      ? 'border-indigo-500 bg-indigo-600/15 text-indigo-200 font-semibold'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="block font-medium">{item.label}</span>
                  <span className="text-[10px] text-slate-500">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Item Count & Exam Specifics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Quantity: <strong className="text-indigo-400">{count} items</strong>
              </label>
              <input
                type="range"
                min="4"
                max="20"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>4 items</span>
                <span>20 items</span>
              </div>
            </div>

            {format === 'exam' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Time Limit: <strong className="text-amber-400">{examTimeLimit} Minutes</strong>
                </label>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={examTimeLimit}
                  onChange={(e) => setExamTimeLimit(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>5 mins</span>
                  <span>60 mins</span>
                </div>
              </div>
            )}
          </div>

          {/* Exam Title (if Exam) */}
          {format === 'exam' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Exam Title
              </label>
              <input
                type="text"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="e.g. Final Diagnostic: Systems & Molecular Biology"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          )}

          {/* Optional Focus Topics */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Focal Topics / Specific Instructions (Optional)
            </label>
            <input
              type="text"
              value={focusTopics}
              onChange={(e) => setFocusTopics(e.target.value)}
              placeholder="e.g. Focus on edge cases, partition tolerance, and immune checkpoints"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Ingested Sources Indicator */}
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                Sources: <strong>{activeDocs.length} active</strong> (
                {activeDocs.reduce((acc, d) => acc + d.wordCount, 0).toLocaleString()} words)
              </span>
            </span>
            <span className="font-mono text-[11px] text-emerald-400">Ready</span>
          </div>

          {error && (
            <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Questions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
