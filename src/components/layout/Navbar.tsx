import React from 'react';
import { Sparkles, Key, PlusCircle, Download, Upload, Cpu, BookOpen } from 'lucide-react';
import { UserSettings } from '../../types/index.js';

interface NavbarProps {
  settings: UserSettings;
  onOpenApiKeyModal: () => void;
  onOpenGenerateModal: () => void;
  onExportData: () => void;
  onImportData: () => void;
  totalDocs: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onOpenApiKeyModal,
  onOpenGenerateModal,
  onExportData,
  onImportData,
  totalDocs,
}) => {
  const hasApiKey = Boolean(settings.geminiApiKey && settings.geminiApiKey.trim().length > 5);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">
                Prep<span className="text-indigo-400">Matrix</span> <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">AI</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Academic Flashcards, Quizzes & High-Standard Practice Exams
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Status Badge */}
          <button
            onClick={onOpenApiKeyModal}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              hasApiKey
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                : 'bg-indigo-950/40 border-indigo-800/40 text-indigo-300 hover:bg-indigo-900/40 hover:border-indigo-700/60'
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            <span className="hidden md:inline">
              {hasApiKey ? `AI: ${settings.geminiModel || 'Gemini 2.5'}` : 'AI: High-Yield Fallback (Add Key)'}
            </span>
            <span className="md:hidden">AI</span>
            <span
              className={`h-2 w-2 rounded-full ${
                hasApiKey ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-400'
              }`}
            />
          </button>

          {/* Quick Generate Action */}
          <button
            onClick={onOpenGenerateModal}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Generate Study Set</span>
          </button>

          {/* Backup / Export Menu */}
          <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
            <button
              onClick={onExportData}
              title="Export All Study Sets & Progress (JSON)"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={onImportData}
              title="Import Saved Study Sets (JSON)"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors"
            >
              <Upload className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
