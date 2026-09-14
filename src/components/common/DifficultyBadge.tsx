import React from 'react';
import { DifficultyLevel } from '../../types/index.js';
import { ShieldCheck, Zap, Sparkles } from 'lucide-react';

interface DifficultyBadgeProps {
  difficulty: DifficultyLevel;
  className?: string;
  showDetail?: boolean;
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({
  difficulty,
  className = '',
  showDetail = false,
}) => {
  if (difficulty === 'easy') {
    return (
      <span
        title="Level 1: Foundational — Core definitions & fundamental mechanisms"
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${className}`}
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Easy</span>
        {showDetail && <span className="opacity-70 font-normal">| Foundational</span>}
      </span>
    );
  }

  if (difficulty === 'medium') {
    return (
      <span
        title="Level 2: Applied — Practical scenarios, diagnostics & problem-solving"
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 ${className}`}
      >
        <Zap className="w-3.5 h-3.5 text-amber-400" />
        <span>Medium</span>
        {showDetail && <span className="opacity-70 font-normal">| Applied</span>}
      </span>
    );
  }

  return (
    <span
      title="Level 3: Advanced & Synthesis — High-stakes critical thinking, edge-cases & trade-offs"
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm shadow-rose-950/50 ${className}`}
    >
      <Sparkles className="w-3.5 h-3.5 text-rose-400" />
      <span>Hard</span>
      {showDetail && <span className="opacity-70 font-normal">| Synthesis</span>}
    </span>
  );
};
