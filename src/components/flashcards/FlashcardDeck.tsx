import React, { useState, useEffect } from 'react';
import {
  RotateCw,
  Volume2,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Download,
  Filter,
  CheckCircle2,
  Layers,
  BookOpen,
  Shuffle,
} from 'lucide-react';
import { DifficultyLevel, Flashcard } from '../../types/index.js';
import { DifficultyBadge } from '../common/DifficultyBadge.js';

interface FlashcardDeckProps {
  flashcards: Flashcard[];
  onUpdateFlashcard: (card: Flashcard) => void;
  onOpenGenerateModal: () => void;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({
  flashcards,
  onUpdateFlashcard,
  onOpenGenerateModal,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Filter flashcards by difficulty
  const filteredCards = flashcards.filter(
    (card) => selectedDifficulty === 'all' || card.difficulty === selectedDifficulty
  );

  const activeCard = filteredCards[currentIndex] || null;

  // Reset flip and hint on card change
  useEffect(() => {
    setIsFlipped(false);
    setShowHint(false);
  }, [currentIndex, selectedDifficulty]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid firing if user is typing in an input
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === '1') {
        handleRate(1);
      } else if (e.key === '2') {
        handleRate(2);
      } else if (e.key === '3') {
        handleRate(3);
      } else if (e.key === '4') {
        handleRate(4);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, filteredCards]);

  const handleNext = () => {
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0); // loop back
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(filteredCards.length - 1);
    }
  };

  const handleRate = (box: 1 | 2 | 3 | 4) => {
    if (!activeCard) return;
    const updated: Flashcard = {
      ...activeCard,
      leitnerBox: box,
      lastReviewed: new Date().toISOString(),
    };
    onUpdateFlashcard(updated);
    handleNext();
  };

  const handleSpeak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleExportCsv = () => {
    const headers = 'Front\tBack\tDifficulty\tCitation\n';
    const rows = flashcards
      .map(
        (c) =>
          `"${c.front.replace(/"/g, '""')}"\t"${c.back.replace(/"/g, '""')}"\t"${c.difficulty}"\t"${c.sourceCitation || ''}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/tab-separated-values;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prepmatrix-flashcards-${new Date().toISOString().slice(0, 10)}.tsv`;
    link.click();
  };

  if (flashcards.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-400">
          <Layers className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">No Flashcards Available</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Ingest documents or website links, then generate your first batch of high-yield active recall flashcards.
        </p>
        <button
          onClick={onOpenGenerateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate Flashcards</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-400" />
            Active Recall Flashcards
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Spaced Repetition & High-Standard Conceptual Reinforcement
          </p>
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
          {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => {
                setSelectedDifficulty(diff);
                setCurrentIndex(0);
              }}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                selectedDifficulty === diff
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Progress & Card Index */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          Card <strong className="text-white">{currentIndex + 1}</strong> of{' '}
          <strong className="text-white">{filteredCards.length}</strong>
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            title="Export for Anki / Quizlet"
            className="flex items-center gap-1 text-slate-400 hover:text-indigo-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export (Anki/TSV)</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-indigo-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / Math.max(1, filteredCards.length)) * 100}%` }}
        />
      </div>

      {/* 3D Flip Card Container */}
      {activeCard ? (
        <div className="perspective-1000 min-h-[360px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
          <div
            className={`relative w-full min-h-[360px] rounded-3xl p-6 sm:p-8 border transition-all duration-500 transform-style-preserve-3d flex flex-col justify-between ${
              isFlipped
                ? 'bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-indigo-500/40 shadow-xl shadow-indigo-950/50'
                : 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border-slate-800 hover:border-slate-700 shadow-xl'
            }`}
          >
            {/* Top Bar on Card */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <DifficultyBadge difficulty={activeCard.difficulty} showDetail />
                {activeCard.leitnerBox === 4 && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Mastered
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleSpeak(isFlipped ? activeCard.back : activeCard.front)}
                  title="Read Aloud"
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                >
                  <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-indigo-400 animate-pulse' : ''}`} />
                </button>
                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  title="Flip Card (Space)"
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="my-6">
              {!isFlipped ? (
                /* FRONT VIEW */
                <div className="space-y-4">
                  <span className="text-xs uppercase tracking-wider text-indigo-400 font-mono font-semibold">
                    Question / Prompt
                  </span>
                  <p className="text-lg sm:text-xl font-medium text-slate-100 leading-relaxed">
                    {activeCard.front}
                  </p>
                </div>
              ) : (
                /* BACK VIEW */
                <div className="space-y-4 animate-in fade-in duration-200">
                  <span className="text-xs uppercase tracking-wider text-emerald-400 font-mono font-semibold">
                    Authoritative Answer
                  </span>
                  <div className="text-base sm:text-lg text-slate-100 leading-relaxed whitespace-pre-line font-normal">
                    {activeCard.back}
                  </div>

                  {activeCard.sourceCitation && (
                    <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-start gap-1.5 italic">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                      <span>Citation: "{activeCard.sourceCitation}"</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Card Footer */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div onClick={(e) => e.stopPropagation()}>
                {activeCard.hint && (
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{showHint ? activeCard.hint : 'Need a Clue?'}</span>
                  </button>
                )}
              </div>

              <div className="text-xs text-slate-500 font-mono">
                {isFlipped ? 'Click or Space to view front' : 'Click or Space to reveal answer'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center p-8 text-slate-500">No cards match the selected filter.</div>
      )}

      {/* Leitner Spaced Repetition Rating Buttons */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
        <div className="text-xs text-slate-400 text-center font-medium">
          Rate your recall to schedule spaced repetition:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => handleRate(1)}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-semibold transition-all active:scale-95"
          >
            <span className="text-sm">Again</span>
            <span className="text-[11px] text-rose-400/70 font-normal">Box 1 • Review Soon (1)</span>
          </button>

          <button
            onClick={() => handleRate(2)}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold transition-all active:scale-95"
          >
            <span className="text-sm">Hard</span>
            <span className="text-[11px] text-amber-400/70 font-normal">Box 2 • Needs Work (2)</span>
          </button>

          <button
            onClick={() => handleRate(3)}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 font-semibold transition-all active:scale-95"
          >
            <span className="text-sm">Good</span>
            <span className="text-[11px] text-blue-400/70 font-normal">Box 3 • Familiar (3)</span>
          </button>

          <button
            onClick={() => handleRate(4)}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-semibold transition-all active:scale-95"
          >
            <span className="text-sm">Easy</span>
            <span className="text-[11px] text-emerald-400/70 font-normal">Box 4 • Mastered (4)</span>
          </button>
        </div>
      </div>

      {/* Prev / Next Navigation Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="text-xs text-slate-500 font-mono hidden sm:block">
          Shortcuts: Space (Flip), Arrows (Next/Prev), 1-4 (Rate)
        </div>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
