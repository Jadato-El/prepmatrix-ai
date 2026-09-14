import React, { useState } from 'react';
import { Printer, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Exam } from '../../types/index.js';

interface PrintExamViewProps {
  exam: Exam;
  onBack: () => void;
}

export const PrintExamView: React.FC<PrintExamViewProps> = ({ exam, onBack }) => {
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);

  const handleTriggerPrint = () => {
    window.print();
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6">
      {/* Screen Controls (Hidden during print) */}
      <div className="no-print flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Exam Dashboard</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIncludeAnswerKey(!includeAnswerKey)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:text-white transition-colors"
          >
            {includeAnswerKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{includeAnswerKey ? 'Exclude Answer Key' : 'Include Answer Key'}</span>
          </button>

          <button
            onClick={handleTriggerPrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet (Standard A4 / Letter styling) */}
      <div className="bg-white text-black p-8 sm:p-12 rounded-2xl shadow-xl space-y-8 font-sans">
        {/* Header */}
        <div className="border-b-2 border-black pb-4 space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold uppercase tracking-wide">{exam.title}</h1>
            <span className="text-xs font-mono border border-black px-2 py-1">
              Time Allowed: {exam.timeLimitMinutes} Mins
            </span>
          </div>
          <p className="text-xs text-gray-700">{exam.description}</p>
          <div className="grid grid-cols-2 gap-4 pt-4 text-xs font-medium border-t border-gray-300 mt-3">
            <div>Candidate Name: _____________________________________</div>
            <div>Date / Candidate ID: ________________________________</div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">
          <strong>Instructions:</strong> Read each question stem carefully. Select the single best answer
          from the four choices provided. Fill in the corresponding bubble on your response sheet.
        </div>

        {/* Questions Section */}
        <div className="space-y-6 pt-2">
          {exam.questions.map((q, qIdx) => (
            <div key={q.id} className="space-y-2 text-sm">
              <div className="flex items-start gap-2 font-medium">
                <span className="font-bold">{qIdx + 1}.</span>
                <span className="flex-1">{q.question}</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 border border-gray-400 rounded text-gray-600">
                  {q.difficulty}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6 pt-1">
                {q.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-start gap-2 text-xs text-gray-800">
                    <span className="font-bold">({optionLetters[optIdx]})</span>
                    <span>{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Answer Key & Rigorous Rationales (Page Break on Print) */}
        {includeAnswerKey && (
          <div className="page-break pt-8 border-t-2 border-black space-y-6">
            <div className="border-b border-gray-400 pb-2">
              <h2 className="text-lg font-bold uppercase">Official Instructor Answer Key & Rationale</h2>
              <p className="text-xs text-gray-600">
                Detailed option-by-option analysis and source citations.
              </p>
            </div>

            <div className="space-y-5">
              {exam.questions.map((q, qIdx) => (
                <div key={q.id} className="text-xs space-y-1.5 p-3 rounded bg-gray-50 border border-gray-200">
                  <div className="flex items-center justify-between font-bold text-gray-900">
                    <span>
                      Question {qIdx + 1}: Correct Answer ({optionLetters[q.correctIndex]})
                    </span>
                    <span className="font-mono text-[10px] text-gray-500">Concept: {q.conceptTested}</span>
                  </div>

                  <div className="space-y-1 text-gray-700 pl-2 border-l-2 border-indigo-400 pt-1">
                    {q.explanations?.map((exp, expIdx) => (
                      <p key={expIdx} className={expIdx === q.correctIndex ? 'font-semibold text-black' : ''}>
                        <strong>({optionLetters[expIdx]}):</strong> {exp}
                      </p>
                    ))}
                  </div>

                  {q.sourceCitation && (
                    <div className="text-[11px] text-gray-500 italic pt-1">
                      Citation: "{q.sourceCitation}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
