import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Flame,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { DifficultyLevel, QuizQuestion } from '../../types/index.js';
import { DifficultyBadge } from '../common/DifficultyBadge.js';

interface QuizRunnerProps {
  questions: QuizQuestion[];
  onOpenGenerateModal: () => void;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({ questions, onOpenGenerateModal }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>(questions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [streak, setStreak] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Sync questions when props change
  React.useEffect(() => {
    const filtered = questions.filter(
      (q) => selectedDifficulty === 'all' || q.difficulty === selectedDifficulty
    );
    setActiveQuestions(filtered);
    setCurrentIndex(0);
    setSelectedOption(null);
    setUserAnswers({});
    setStreak(0);
    setIsCompleted(false);
  }, [questions, selectedDifficulty]);

  const currentQuestion = activeQuestions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null) return; // Prevent changing after revealing
    setSelectedOption(idx);
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: idx }));

    if (idx === currentQuestion.correctIndex) {
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setIsCompleted(true);
      // Confetti on good score
      const correctCount = Object.entries(userAnswers).filter(
        ([qIdx, ans]) => activeQuestions[Number(qIdx)]?.correctIndex === ans
      ).length;
      if (correctCount / activeQuestions.length >= 0.7) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setUserAnswers({});
    setStreak(0);
    setIsCompleted(false);
  };

  const handleRetryMissed = () => {
    const missed = activeQuestions.filter(
      (_, qIdx) => userAnswers[qIdx] !== activeQuestions[qIdx].correctIndex
    );
    if (missed.length === 0) return;
    setActiveQuestions(missed);
    setCurrentIndex(0);
    setSelectedOption(null);
    setUserAnswers({});
    setStreak(0);
    setIsCompleted(false);
  };

  if (activeQuestions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-400">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">No Quiz Questions Found</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Generate an interactive quiz from your ingested documents or web articles.
        </p>
        <button
          onClick={onOpenGenerateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate Quiz</span>
        </button>
      </div>
    );
  }

  // Quiz Completed View
  if (isCompleted) {
    const total = activeQuestions.length;
    const correctCount = Object.entries(userAnswers).filter(
      ([qIdx, ans]) => activeQuestions[Number(qIdx)]?.correctIndex === ans
    ).length;
    const percentage = Math.round((correctCount / total) * 100);
    const missedCount = total - correctCount;

    return (
      <div className="max-w-2xl mx-auto p-6 sm:p-8 space-y-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">Quiz Session Completed!</h2>
            <p className="text-sm text-slate-400 mt-1">Here is your performance diagnostic:</p>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div>
              <div className="text-2xl font-bold text-white">{correctCount}/{total}</div>
              <div className="text-xs text-slate-400">Correct</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${percentage >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {percentage}%
              </div>
              <div className="text-xs text-slate-400">Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-400">{missedCount}</div>
              <div className="text-xs text-slate-400">Needs Review</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {missedCount > 0 && (
              <button
                onClick={handleRetryMissed}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold transition-all shadow-md shadow-amber-600/30"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Missed Questions ({missedCount})</span>
              </button>
            )}

            <button
              onClick={handleRestart}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-all"
            >
              <span>Restart Quiz</span>
            </button>

            <button
              onClick={onOpenGenerateModal}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>New Questions</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const optionLetters = ['A', 'B', 'C', 'D'];
  const hasAnswered = selectedOption !== null;
  const isAnswerCorrect = selectedOption === currentQuestion.correctIndex;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Bar: Progress & Streak */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            Question <strong className="text-white">{currentIndex + 1}</strong> of{' '}
            <strong className="text-white">{activeQuestions.length}</strong>
          </span>
          <DifficultyBadge difficulty={currentQuestion.difficulty} showDetail />
        </div>

        {streak > 1 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold animate-bounce">
            <Flame className="w-3.5 h-3.5 fill-amber-400" />
            <span>{streak} Streak!</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-indigo-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / activeQuestions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6 shadow-xl">
        <div>
          <span className="text-xs uppercase tracking-wider text-indigo-400 font-mono font-semibold">
            Concept: {currentQuestion.conceptTested}
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-white mt-2 leading-relaxed">
            {currentQuestion.question}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQuestion.correctIndex;

            let btnStyle = 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-200';
            if (hasAnswered) {
              if (isCorrect) {
                btnStyle = 'border-emerald-500/80 bg-emerald-950/30 text-emerald-200 shadow-md shadow-emerald-950/30 font-medium';
              } else if (isSelected) {
                btnStyle = 'border-rose-500/80 bg-rose-950/30 text-rose-200 font-medium';
              } else {
                btnStyle = 'border-slate-800/60 bg-slate-950/30 text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                disabled={hasAnswered}
                onClick={() => handleSelectOption(idx)}
                className={`w-full flex items-start gap-3.5 p-4 rounded-2xl border text-left text-sm transition-all duration-150 ${btnStyle}`}
              >
                <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 border ${
                  hasAnswered && isCorrect
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : hasAnswered && isSelected
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {optionLetters[idx]}
                </span>
                <span className="flex-1 leading-relaxed">{opt}</span>

                {hasAnswered && (
                  <span className="shrink-0 pt-0.5">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : isSelected ? (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    ) : null}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Immediate Explanation Rationale Block */}
        {hasAnswered && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2">
              {isAnswerCorrect ? (
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Correct Answer!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <XCircle className="w-4 h-4" />
                  <span>Incorrect — See Rigorous Rationale:</span>
                </div>
              )}
            </div>

            {/* Option Rationale Breakdown */}
            <div className="space-y-2 text-xs leading-relaxed text-slate-300">
              {currentQuestion.explanations && currentQuestion.explanations.length > 0 ? (
                currentQuestion.explanations.map((exp, expIdx) => (
                  <div
                    key={expIdx}
                    className={`p-2.5 rounded-xl border ${
                      expIdx === currentQuestion.correctIndex
                        ? 'border-emerald-500/20 bg-emerald-950/20 text-emerald-200'
                        : expIdx === selectedOption
                        ? 'border-rose-500/20 bg-rose-950/20 text-rose-200'
                        : 'border-slate-800/60 bg-slate-900/30 text-slate-400'
                    }`}
                  >
                    <strong>Option {optionLetters[expIdx]}:</strong> {exp}
                  </div>
                ))
              ) : (
                <div className="text-slate-300">
                  Option {optionLetters[currentQuestion.correctIndex]} is correct.
                </div>
              )}
            </div>

            {currentQuestion.sourceCitation && (
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-start gap-1.5 italic">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                <span>Citation: "{currentQuestion.sourceCitation}"</span>
              </div>
            )}
          </div>
        )}

        {/* Next Question Button */}
        {hasAnswered && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-95"
            >
              <span>{currentIndex < activeQuestions.length - 1 ? 'Next Question' : 'Complete Quiz'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
