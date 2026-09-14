import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar.js';
import { Sidebar, ActiveTab } from './components/layout/Sidebar.js';
import { DocumentManager } from './components/ingestion/DocumentManager.js';
import { FlashcardDeck } from './components/flashcards/FlashcardDeck.js';
import { QuizRunner } from './components/quiz/QuizRunner.js';
import { ExamSimulator } from './components/exam/ExamSimulator.js';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard.js';
import { ApiKeyModal } from './components/modals/ApiKeyModal.js';
import { GenerateModal } from './components/modals/GenerateModal.js';
import { StorageService } from './services/storage.js';
import { DocumentSource, Exam, ExamAttempt, Flashcard, QuizQuestion, UserSettings } from './types/index.js';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('documents');
  const [documents, setDocuments] = useState<DocumentSource[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [settings, setSettings] = useState<UserSettings>(StorageService.getSettings());
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  // Modals state
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  // Initialize data from local storage
  useEffect(() => {
    const loadedDocs = StorageService.getDocuments();
    setDocuments(loadedDocs);
    setSelectedDocIds(loadedDocs.map((d) => d.id));
    setFlashcards(StorageService.getFlashcards());
    setQuizzes(StorageService.getQuizzes());
    setExams(StorageService.getExams());
    setAttempts(StorageService.getAttempts());
    setSettings(StorageService.getSettings());
  }, []);

  // Handlers for Documents
  const handleAddDocument = (doc: DocumentSource) => {
    StorageService.addDocument(doc);
    setDocuments((prev) => [doc, ...prev]);
    setSelectedDocIds((prev) => [doc.id, ...prev]);
  };

  const handleAddMultipleDocuments = (docs: DocumentSource[]) => {
    docs.forEach((d) => StorageService.addDocument(d));
    setDocuments(StorageService.getDocuments());
    setSelectedDocIds((prev) => [...docs.map((d) => d.id), ...prev]);
  };

  const handleDeleteDocument = (id: string) => {
    StorageService.deleteDocument(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setSelectedDocIds((prev) => prev.filter((dId) => dId !== id));
  };

  const handleToggleSelectDoc = (id: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((dId) => dId !== id) : [...prev, id]
    );
  };

  const handleSelectAllDocs = () => {
    setSelectedDocIds(documents.map((d) => d.id));
  };

  const handleDeselectAllDocs = () => {
    setSelectedDocIds([]);
  };

  // Handlers for Flashcards
  const handleUpdateFlashcard = (card: Flashcard) => {
    StorageService.updateFlashcard(card);
    setFlashcards((prev) => prev.map((c) => (c.id === card.id ? card : c)));
  };

  const handleGeneratedFlashcards = (newCards: Flashcard[]) => {
    StorageService.addFlashcards(newCards);
    setFlashcards(StorageService.getFlashcards());
  };

  // Handlers for Quizzes
  const handleGeneratedQuiz = (newQuestions: QuizQuestion[]) => {
    StorageService.addQuizzes(newQuestions);
    setQuizzes(StorageService.getQuizzes());
  };

  // Handlers for Exams
  const handleGeneratedExam = (exam: Exam) => {
    StorageService.addExam(exam);
    setExams(StorageService.getExams());
  };

  const handleSaveAttempt = (attempt: ExamAttempt) => {
    StorageService.saveAttempt(attempt);
    setAttempts(StorageService.getAttempts());
  };

  // Settings
  const handleSaveSettings = (newSettings: UserSettings) => {
    StorageService.saveSettings(newSettings);
    setSettings(newSettings);
  };

  // Export & Import
  const handleExportData = () => {
    const backupJson = StorageService.exportBackup();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prepmatrix-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      const success = StorageService.importBackup(text);
      if (success) {
        setDocuments(StorageService.getDocuments());
        setFlashcards(StorageService.getFlashcards());
        setQuizzes(StorageService.getQuizzes());
        setExams(StorageService.getExams());
        setAttempts(StorageService.getAttempts());
        setSettings(StorageService.getSettings());
        alert('Study sets and attempts successfully restored!');
      } else {
        alert('Failed to parse backup JSON file.');
      }
    };
    input.click();
  };

  const masteredCardsCount = flashcards.filter((c) => c.leitnerBox === 4).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navigation Bar */}
      <Navbar
        settings={settings}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenGenerateModal={() => setIsGenerateModalOpen(true)}
        onExportData={handleExportData}
        onImportData={handleImportData}
        totalDocs={documents.length}
      />

      {/* Main Body */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          counts={{
            documents: documents.length,
            flashcards: flashcards.length,
            quizzes: quizzes.length,
            exams: exams.length,
            masteredCards: masteredCardsCount,
          }}
        />

        <main className="flex-1 overflow-y-auto pb-16">
          {activeTab === 'documents' && (
            <DocumentManager
              documents={documents}
              selectedDocIds={selectedDocIds}
              onToggleSelectDoc={handleToggleSelectDoc}
              onSelectAllDocs={handleSelectAllDocs}
              onDeselectAllDocs={handleDeselectAllDocs}
              onAddDocument={handleAddDocument}
              onAddMultipleDocuments={handleAddMultipleDocuments}
              onDeleteDocument={handleDeleteDocument}
              onOpenGenerateModal={() => setIsGenerateModalOpen(true)}
            />
          )}

          {activeTab === 'flashcards' && (
            <FlashcardDeck
              flashcards={flashcards}
              onUpdateFlashcard={handleUpdateFlashcard}
              onOpenGenerateModal={() => setIsGenerateModalOpen(true)}
            />
          )}

          {activeTab === 'quiz' && (
            <QuizRunner
              questions={quizzes}
              onOpenGenerateModal={() => setIsGenerateModalOpen(true)}
            />
          )}

          {activeTab === 'exam' && (
            <ExamSimulator
              exams={exams}
              onSaveAttempt={handleSaveAttempt}
              onOpenGenerateModal={() => setIsGenerateModalOpen(true)}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsDashboard
              flashcards={flashcards}
              quizzes={quizzes}
              attempts={attempts}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      <GenerateModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        documents={documents}
        selectedDocIds={selectedDocIds}
        settings={settings}
        onGeneratedFlashcards={handleGeneratedFlashcards}
        onGeneratedQuiz={handleGeneratedQuiz}
        onGeneratedExam={handleGeneratedExam}
        onNavigateToTab={(tab) => setActiveTab(tab)}
      />
    </div>
  );
};

export default App;
