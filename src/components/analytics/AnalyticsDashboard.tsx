import React from 'react';
import {
  BarChart3,
  Award,
  Layers,
  GraduationCap,
  Clock,
  ShieldCheck,
  Zap,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { ExamAttempt, Flashcard, QuizQuestion } from '../../types/index.js';

interface AnalyticsDashboardProps {
  flashcards: Flashcard[];
  quizzes: QuizQuestion[];
  attempts: ExamAttempt[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  flashcards,
  quizzes,
  attempts,
}) => {
  const masteredCards = flashcards.filter((c) => c.leitnerBox === 4).length;
  const totalCards = flashcards.length;
  const flashcardMasteryPct = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;

  const totalExamsTaken = attempts.length;
  const avgExamScore =
    totalExamsTaken > 0
      ? Math.round(attempts.reduce((acc, curr) => acc + curr.percentage, 0) / totalExamsTaken)
      : 0;

  // Aggregate difficulty statistics across all exam attempts
  let easyCorrect = 0,
    easyTotal = 0;
  let medCorrect = 0,
    medTotal = 0;
  let hardCorrect = 0,
    hardTotal = 0;

  attempts.forEach((a) => {
    if (a.difficultyBreakdown) {
      easyCorrect += a.difficultyBreakdown.easy?.correct || 0;
      easyTotal += a.difficultyBreakdown.easy?.total || 0;
      medCorrect += a.difficultyBreakdown.medium?.correct || 0;
      medTotal += a.difficultyBreakdown.medium?.total || 0;
      hardCorrect += a.difficultyBreakdown.hard?.correct || 0;
      hardTotal += a.difficultyBreakdown.hard?.total || 0;
    }
  });

  const easyPct = easyTotal > 0 ? Math.round((easyCorrect / easyTotal) * 100) : 0;
  const medPct = medTotal > 0 ? Math.round((medCorrect / medTotal) * 100) : 0;
  const hardPct = hardTotal > 0 ? Math.round((hardCorrect / hardTotal) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-400" />
          Performance & Mastery Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Detailed cognitive breakdown across foundational recall, applied reasoning, and synthesis.
        </p>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Flashcard Mastery */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Card Mastery</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{flashcardMasteryPct}%</div>
          <div className="text-[11px] text-slate-500">
            {masteredCards} of {totalCards} mastered
          </div>
        </div>

        {/* Exam Average */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Exam Average</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {totalExamsTaken > 0 ? `${avgExamScore}%` : 'N/A'}
          </div>
          <div className="text-[11px] text-slate-500">{totalExamsTaken} attempts completed</div>
        </div>

        {/* Practice Exams */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Exams Taken</span>
            <GraduationCap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalExamsTaken}</div>
          <div className="text-[11px] text-slate-500">Simulations logged</div>
        </div>

        {/* Questions In Bank */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Question Bank</span>
            <TrendingUp className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-white">{quizzes.length}</div>
          <div className="text-[11px] text-slate-500">Curated items</div>
        </div>
      </div>

      {/* Difficulty Mastery Breakdown (Bloom's Taxonomy) */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-6 shadow-xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Performance by Academic Difficulty Level
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Diagnostic accuracy across the three calibrated cognitive standards.
          </p>
        </div>

        <div className="space-y-4">
          {/* Level 1: Easy / Foundational */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Level 1: Foundational (Easy)
              </span>
              <span className="font-mono text-slate-300">
                {easyTotal > 0 ? `${easyPct}% (${easyCorrect}/${easyTotal})` : 'Not tested yet'}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${easyTotal > 0 ? easyPct : 0}%` }}
              />
            </div>
          </div>

          {/* Level 2: Medium / Applied */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> Level 2: Applied (Medium)
              </span>
              <span className="font-mono text-slate-300">
                {medTotal > 0 ? `${medPct}% (${medCorrect}/${medTotal})` : 'Not tested yet'}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${medTotal > 0 ? medPct : 0}%` }}
              />
            </div>
          </div>

          {/* Level 3: Hard / Advanced Synthesis */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-rose-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Level 3: Advanced Synthesis (Hard)
              </span>
              <span className="font-mono text-slate-300">
                {hardTotal > 0 ? `${hardPct}% (${hardCorrect}/${hardTotal})` : 'Not tested yet'}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-rose-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${hardTotal > 0 ? hardPct : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Cognitive Insight Box */}
        <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 space-y-1 leading-relaxed">
            <strong className="text-white block">Curriculum Diagnostic Note:</strong>
            {hardTotal > 0 && hardPct < 70 ? (
              <span>
                Your foundational knowledge is solid, but Level 3 questions with multi-variable trade-offs need extra focus. Use the 3D flashcards with "Hard" filter to review edge cases.
              </span>
            ) : totalExamsTaken === 0 ? (
              <span>
                Take your first simulated practice exam to unlock in-depth diagnostic recommendations.
              </span>
            ) : (
              <span>
                Strong mastery across all difficulty tiers! Continue spaced repetition to maintain long-term memory retention.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Exam Attempts History Log */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          Exam Attempts History
        </h2>

        {attempts.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-800 text-slate-500 text-xs">
            No exam sessions logged yet.
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden divide-y divide-slate-800/60">
            {attempts.map((att) => (
              <div
                key={att.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h3 className="font-semibold text-white text-sm">{att.examTitle}</h3>
                  <div className="flex items-center gap-2 text-slate-400 mt-0.5">
                    <span>{new Date(att.completedAt).toLocaleString()}</span>
                    <span>•</span>
                    <span>Time: {Math.floor(att.timeSpentSeconds / 60)}m {att.timeSpentSeconds % 60}s</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span
                      className={`font-bold font-mono text-sm ${
                        att.percentage >= 70 ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {att.percentage}%
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      {att.score}/{att.totalQuestions}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full font-semibold text-[11px] ${
                      att.passed
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {att.passed ? 'PASSED' : 'REVISE'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
