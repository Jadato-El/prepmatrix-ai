import React from 'react';
import {
  BookOpen,
  Layers,
  HelpCircle,
  GraduationCap,
  BarChart3,
  FileText,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export type ActiveTab = 'documents' | 'flashcards' | 'quiz' | 'exam' | 'analytics';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  counts: {
    documents: number;
    flashcards: number;
    quizzes: number;
    exams: number;
    masteredCards: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, counts }) => {
  const navItems = [
    {
      id: 'documents' as ActiveTab,
      label: 'Sources & Ingestion',
      icon: BookOpen,
      count: counts.documents,
      description: 'Upload PDFs, URLs & Notes',
    },
    {
      id: 'flashcards' as ActiveTab,
      label: 'Flashcards Deck',
      icon: Layers,
      count: counts.flashcards,
      description: 'Spaced repetition active recall',
    },
    {
      id: 'quiz' as ActiveTab,
      label: 'Interactive Quiz',
      icon: HelpCircle,
      count: counts.quizzes,
      description: 'Instant feedback & explanations',
    },
    {
      id: 'exam' as ActiveTab,
      label: 'Practice Exam',
      icon: GraduationCap,
      count: counts.exams,
      description: 'Timed full exam simulation',
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'Performance & Mastery',
      icon: BarChart3,
      count: null,
      description: 'Scorecards & difficulty analysis',
    },
  ];

  return (
    <aside className="w-full md:w-64 border-r border-slate-800 bg-slate-950/40 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Study Modules
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? 'text-indigo-400' : 'text-slate-400'
                    }`}
                  />
                  <div className="truncate">
                    <span className="block truncate">{item.label}</span>
                  </div>
                </div>
                {item.count !== null && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                      isActive
                        ? 'bg-indigo-500/30 text-indigo-200'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quick Summary Card */}
      <div className="mt-6 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Active Mastery</span>
          <span className="text-emerald-400 font-bold">
            {counts.flashcards > 0
              ? `${Math.round((counts.masteredCards / counts.flashcards) * 100)}%`
              : '0%'}
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{
              width: `${
                counts.flashcards > 0
                  ? Math.min(100, Math.round((counts.masteredCards / counts.flashcards) * 100))
                  : 0
              }%`,
            }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            {counts.masteredCards} Mastered
          </span>
          <span>{counts.flashcards} Total Cards</span>
        </div>
      </div>
    </aside>
  );
};
