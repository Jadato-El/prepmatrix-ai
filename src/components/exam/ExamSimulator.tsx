import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  GraduationCap,
  Clock,
  Bookmark,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Printer,
  RotateCcw,
  BookOpen,
  ChevronRight,
  Award,
  BarChart,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Exam, ExamAttempt, QuizQuestion } from '../../types/index.js';
import { DifficultyBadge } from '../common/DifficultyBadge.js';
import { PrintExamView } from './PrintExamView.js';

interface ExamSimulatorProps {
  exams: Exam[];
  onSaveAttempt: (attempt: ExamAttempt) => void;
  onOpenGenerateModal: () => void;
}

export const ExamSimulator: React.FC<ExamSimulatorProps> = ({
  exams,
  onSaveAttempt,
  onOpenGenerateModal,
}) => {
  const [activeExam, setActiveExam] = useState<Exam | null>(exams[0] || null);
  const [mode, setMode] = useState<'list' | 'in-progress' | 'scorecard' | 'print'>('list');

  // Exam taking state
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<ExamAttempt | null>(null);

  // Sync active exam if exams change
  useEffect(() => {
    if (!activeExam && exams.length > 0) {
      setActiveExam(exams[0]);
    }
  }, [exams, activeExam]);

  // Countdown timer in in-progress mode
  useEffect(() => {
    if (mode !== 'in-progress') return;

    if (secondsRemaining <= 0) {
      // Auto-submit when time expires!
      handleSubmitExam();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, secondsRemaining]);

  const handleStartExam = (exam: Exam) => {
    setActiveExam(exam);
    setCurrentQuestionIdx(0);
    setUserAnswers({});
    setFlaggedIds([]);
    setSecondsRemaining(exam.timeLimitMinutes * 60);
    setIsSubmitModalOpen(false);
    setMode('in-progress');
  };

  const handleSelectAnswer = (qId: string, optIdx: number) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleToggleFlag = (qId: string) => {
    setFlaggedIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const handleSubmitExam = () => {
    if (!activeExam) return;

    const totalQuestions = activeExam.questions.length;
    let score = 0;
    const difficultyBreakdown = {
      easy: { correct: 0, total: 0 },
      medium: { correct: 0, total: 0 },
      hard: { correct: 0, total: 0 },
    };

    activeExam.questions.forEach((q) => {
      const isCorrect = userAnswers[q.id] === q.correctIndex;
      if (isCorrect) score += 1;

      if (q.difficulty in difficultyBreakdown) {
        difficultyBreakdown[q.difficulty].total += 1;
        if (isCorrect) difficultyBreakdown[q.difficulty].correct += 1;
      }
    });

    const percentage = Math.round((score / totalQuestions) * 100);
    const passed = percentage >= (activeExam.passingPercentage || 70);
    const timeSpent = activeExam.timeLimitMinutes * 60 - Math.max(0, secondsRemaining);

    const attempt: ExamAttempt = {
      id: `attempt-${Date.now()}`,
      examId: activeExam.id,
      examTitle: activeExam.title,
      score,
      totalQuestions,
      percentage,
      passed,
      timeSpentSeconds: timeSpent,
      completedAt: new Date().toISOString(),
      userAnswers,
      flaggedQuestionIds: flaggedIds,
      difficultyBreakdown,
    };

    onSaveAttempt(attempt);
    setLastAttempt(attempt);
    setIsSubmitModalOpen(false);
    setMode('scorecard');

    if (passed) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  // 1. PRINT MODE
  if (mode === 'print' && activeExam) {
    return <PrintExamView exam={activeExam} onBack={() => setMode('list')} />;
  }

  // 2. SCORECARD MODE
  if (mode === 'scorecard' && activeExam && lastAttempt) {
    const getGrade = (pct: number) => {
      if (pct >= 93) return { grade: 'A+', color: 'text-emerald-400' };
      if (pct >= 85) return { grade: 'A', color: 'text-emerald-400' };
      if (pct >= 75) return { grade: 'B', color: 'text-blue-400' };
      if (pct >= 70) return { grade: 'C', color: 'text-amber-400' };
      return { grade: 'F', color: 'text-rose-400' };
    };

    const gradeInfo = getGrade(lastAttempt.percentage);
    const optionLetters = ['A', 'B', 'C', 'D'];

    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
        {/* Scorecard Header Banner */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-xs uppercase tracking-wider font-mono text-indigo-400 font-semibold">
                Official Examination Scorecard
              </span>
              <h1 className="text-2xl font-bold text-white mt-1">{activeExam.title}</h1>
              <p className="text-xs text-slate-400 mt-1">
                Completed on {new Date(lastAttempt.completedAt).toLocaleDateString()} • Time spent:{' '}
                {Math.floor(lastAttempt.timeSpentSeconds / 60)}m {lastAttempt.timeSpentSeconds % 60}s
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-950/70 px-5 py-3 rounded-2xl border border-slate-800 shrink-0">
              <div className="text-right">
                <div className={`text-4xl font-extrabold ${gradeInfo.color}`}>
                  {lastAttempt.percentage}%
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  {lastAttempt.score} / {lastAttempt.totalQuestions} Questions
                </div>
              </div>
              <div className="text-3xl font-black border-l border-slate-800 pl-4 text-white">
                {gradeInfo.grade}
              </div>
            </div>
          </div>

          {/* Difficulty Breakdown Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Easy */}
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Foundational (Easy)
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  {lastAttempt.difficultyBreakdown.easy.correct} /{' '}
                  {lastAttempt.difficultyBreakdown.easy.total}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">Core definitions & direct principles</div>
            </div>

            {/* Medium */}
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> Applied (Medium)
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  {lastAttempt.difficultyBreakdown.medium.correct} /{' '}
                  {lastAttempt.difficultyBreakdown.medium.total}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">Scenario analysis & diagnostics</div>
            </div>

            {/* Hard */}
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Advanced Synthesis (Hard)
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  {lastAttempt.difficultyBreakdown.hard.correct} /{' '}
                  {lastAttempt.difficultyBreakdown.hard.total}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">Multi-step edge-cases & trade-offs</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => handleStartExam(activeExam)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Full Exam</span>
            </button>

            <button
              onClick={() => setMode('print')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Exam Sheet & Answer Key</span>
            </button>

            <button
              onClick={() => setMode('list')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-all text-xs sm:text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Exams List</span>
            </button>
          </div>
        </div>

        {/* Detailed Question-by-Question Review */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Detailed Post-Exam Review & Rationale
          </h2>

          <div className="space-y-4">
            {activeExam.questions.map((q, idx) => {
              const userChoice = lastAttempt.userAnswers[q.id];
              const isCorrect = userChoice === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className={`rounded-2xl border p-5 space-y-4 transition-all ${
                    isCorrect
                      ? 'border-emerald-500/30 bg-slate-900/40'
                      : 'border-rose-500/30 bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-slate-800 text-slate-300">
                        Q{idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <DifficultyBadge difficulty={q.difficulty} />
                          <span className="text-xs text-slate-400">Concept: {q.conceptTested}</span>
                        </div>
                        <h3 className="text-sm font-medium text-white leading-relaxed">
                          {q.question}
                        </h3>
                      </div>
                    </div>

                    <span className="shrink-0">
                      {isCorrect ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                          <XCircle className="w-3.5 h-3.5" /> Incorrect
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Options with Indicator */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                    {q.options.map((opt, optIdx) => {
                      const isOptionCorrect = optIdx === q.correctIndex;
                      const isOptionSelected = optIdx === userChoice;

                      let style = 'border-slate-800 bg-slate-950/40 text-slate-400';
                      if (isOptionCorrect) {
                        style = 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300 font-medium';
                      } else if (isOptionSelected) {
                        style = 'border-rose-500/50 bg-rose-950/20 text-rose-300';
                      }

                      return (
                        <div key={optIdx} className={`p-2.5 rounded-xl border text-xs flex items-start gap-2 ${style}`}>
                          <span className="font-mono font-bold">({optionLetters[optIdx]})</span>
                          <span className="flex-1">{opt}</span>
                          {isOptionCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                          {!isOptionCorrect && isOptionSelected && <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Rigorous Rationale Breakdown */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-1.5 leading-relaxed text-slate-300">
                    <span className="font-semibold text-indigo-300 block mb-1">
                      Academic Distractor Rationale:
                    </span>
                    {q.explanations?.map((exp, expIdx) => (
                      <div
                        key={expIdx}
                        className={expIdx === q.correctIndex ? 'text-emerald-300 font-medium' : 'text-slate-400'}
                      >
                        <strong>({optionLetters[expIdx]}):</strong> {exp}
                      </div>
                    ))}
                  </div>

                  {q.sourceCitation && (
                    <div className="text-[11px] text-slate-400 italic flex items-center gap-1.5 pt-1 border-t border-slate-800/60">
                      <BookOpen className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span>Source: "{q.sourceCitation}"</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 3. IN-PROGRESS TIMED EXAM MODE
  if (mode === 'in-progress' && activeExam) {
    const currentQ = activeExam.questions[currentQuestionIdx];
    const isUnderTwoMins = secondsRemaining < 120;
    const isUnderOneMin = secondsRemaining < 60;
    const isFlagged = flaggedIds.includes(currentQ.id);
    const answeredCount = Object.keys(userAnswers).length;
    const optionLetters = ['A', 'B', 'C', 'D'];

    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Exam Header & Live Countdown */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white truncate max-w-md">
              {activeExam.title}
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span>
                Question {currentQuestionIdx + 1} of {activeExam.questions.length}
              </span>
              <span>•</span>
              <span className="text-indigo-400">{answeredCount} Answered</span>
            </div>
          </div>

          {/* Countdown Clock */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-sm sm:text-base ${
              isUnderOneMin
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse'
                : isUnderTwoMins
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                : 'bg-slate-950 border-slate-800 text-indigo-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>
        </div>

        {/* Main Test Layout (Grid + Question Area) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigator Palette (Desktop Sidebar) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                Question Navigator
              </span>

              <div className="grid grid-cols-5 gap-2">
                {activeExam.questions.map((q, idx) => {
                  const isCurrent = idx === currentQuestionIdx;
                  const isAnswered = q.id in userAnswers;
                  const qFlagged = flaggedIds.includes(q.id);

                  let btnColor = 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700';
                  if (isCurrent) {
                    btnColor = 'ring-2 ring-indigo-500 bg-indigo-950 text-white font-bold border-indigo-500';
                  } else if (qFlagged) {
                    btnColor = 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold';
                  } else if (isAnswered) {
                    btnColor = 'bg-indigo-600/30 border-indigo-500/40 text-indigo-300';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIdx(idx)}
                      className={`h-9 rounded-xl border text-xs font-mono transition-all flex items-center justify-center relative ${btnColor}`}
                    >
                      {idx + 1}
                      {qFlagged && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-indigo-600/40 border border-indigo-500/40" />
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500/40 border border-amber-500/40" />
                  <span>Flagged for Review ({flaggedIds.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-slate-950 border border-slate-800" />
                  <span>Unanswered ({activeExam.questions.length - answeredCount})</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all"
            >
              Submit Exam Now
            </button>
          </div>

          {/* Question Area */}
          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6 shadow-xl">
              {/* Question Top Controls */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-400">
                    Question {currentQuestionIdx + 1}
                  </span>
                  <DifficultyBadge difficulty={currentQ.difficulty} showDetail />
                </div>

                <button
                  onClick={() => handleToggleFlag(currentQ.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    isFlagged
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-white border border-transparent'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-400' : ''}`} />
                  <span>{isFlagged ? 'Flagged for Review' : 'Flag Question'}</span>
                </button>
              </div>

              {/* Stem */}
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wider text-slate-500 font-mono">
                  Concept: {currentQ.conceptTested}
                </span>
                <p className="text-base sm:text-lg font-medium text-white leading-relaxed">
                  {currentQ.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = userAnswers[currentQ.id] === optIdx;

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectAnswer(currentQ.id, optIdx)}
                      className={`w-full flex items-start gap-3.5 p-4 rounded-2xl border text-left text-sm transition-all duration-150 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-md shadow-indigo-950/50 font-medium'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 border ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-400'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {optionLetters[optIdx]}
                      </span>
                      <span className="flex-1 leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Nav Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                <button
                  disabled={currentQuestionIdx === 0}
                  onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 transition-colors text-xs sm:text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {currentQuestionIdx < activeExam.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIdx((p) => p + 1)}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-indigo-600/30"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-emerald-600/30"
                  >
                    <span>Review & Submit</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white">Ready to submit examination?</h3>
                <p className="text-xs text-slate-400">
                  You have answered <strong className="text-white">{answeredCount}</strong> of{' '}
                  <strong className="text-white">{activeExam.questions.length}</strong> questions.
                  {activeExam.questions.length - answeredCount > 0 && (
                    <span className="block text-amber-400 font-semibold mt-1">
                      {activeExam.questions.length - answeredCount} questions remain unanswered!
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors"
                >
                  Continue Test
                </button>
                <button
                  onClick={handleSubmitExam}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-md transition-all"
                >
                  Confirm & Grade
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 4. EXAM LIST / DASHBOARD MODE (Default)
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-400" />
            Simulated Practice Examinations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Full-length timed assessments with rigorous distractor engineering and diagnostic analytics.
          </p>
        </div>

        <button
          onClick={onOpenGenerateModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate New Exam</span>
        </button>
      </div>

      {exams.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 space-y-3">
          <GraduationCap className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-300">No exams generated yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create full-length timed exams from your uploaded documents or web links.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 p-6 space-y-4 transition-all shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-white">{exam.title}</h2>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                    {exam.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setActiveExam(exam);
                      setMode('print');
                    }}
                    title="Print Exam"
                    className="p-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleStartExam(exam)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all active:scale-95"
                  >
                    <span>Start Timed Exam</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 pt-3 border-t border-slate-800/80">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                  {exam.questions.length} Questions
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {exam.timeLimitMinutes} Minutes
                </span>
                <span>•</span>
                <span>Pass threshold: {exam.passingPercentage}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
