import React, { useState, useRef } from 'react';
import {
  Globe,
  UploadCloud,
  FileText,
  FileCode,
  Trash2,
  Eye,
  Plus,
  CheckSquare,
  Square,
  Sparkles,
  ExternalLink,
  BookOpen,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { DocumentSource } from '../../types/index.js';
import { ApiService } from '../../services/api.js';

interface DocumentManagerProps {
  documents: DocumentSource[];
  selectedDocIds: string[];
  onToggleSelectDoc: (id: string) => void;
  onSelectAllDocs: () => void;
  onDeselectAllDocs: () => void;
  onAddDocument: (doc: DocumentSource) => void;
  onAddMultipleDocuments: (docs: DocumentSource[]) => void;
  onDeleteDocument: (id: string) => void;
  onOpenGenerateModal: () => void;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  documents,
  selectedDocIds,
  onToggleSelectDoc,
  onSelectAllDocs,
  onDeselectAllDocs,
  onAddDocument,
  onAddMultipleDocuments,
  onDeleteDocument,
  onOpenGenerateModal,
}) => {
  const [activeInputTab, setActiveInputTab] = useState<'url' | 'file' | 'text'>('url');
  
  // URL Form state
  const [urlInput, setUrlInput] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Text Form state
  const [textTitle, setTextTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [isSavingText, setIsSavingText] = useState(false);

  // File Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview Drawer
  const [previewDoc, setPreviewDoc] = useState<DocumentSource | null>(null);

  // Handle URL Scrape
  const handleScrapeUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsScraping(true);
    setUrlError(null);

    try {
      const doc = await ApiService.ingestUrl(urlInput.trim());
      onAddDocument(doc);
      setUrlInput('');
    } catch (err: any) {
      setUrlError(err.response?.data?.error || err.message || 'Failed to extract content from this website.');
    } finally {
      setIsScraping(false);
    }
  };

  // Handle File Upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const fileArray = Array.from(files);
      const docs = await ApiService.ingestFiles(fileArray);
      onAddMultipleDocuments(docs);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setUploadError(err.response?.data?.error || err.message || 'Failed to parse uploaded files.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Manual Notes
  const handleSaveText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textContent.trim()) return;

    setIsSavingText(true);
    try {
      const doc = await ApiService.ingestText(textTitle, textContent);
      onAddDocument(doc);
      setTextTitle('');
      setTextContent('');
    } catch (err: any) {
      alert(err.message || 'Failed to save note');
    } finally {
      setIsSavingText(false);
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            Knowledge Ingestion & Document Library
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Feed articles, textbook chapters, PDFs, or lecture notes. PrepMatrix extracts key concepts and generates high-standard study packs.
          </p>
        </div>

        {documents.length > 0 && (
          <button
            onClick={onOpenGenerateModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate From Sources ({selectedDocIds.length})</span>
          </button>
        )}
      </div>

      {/* Input Methods Tabs */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 mb-4">
          <button
            onClick={() => setActiveInputTab('url')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeInputTab === 'url'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Website Article / Link</span>
          </button>

          <button
            onClick={() => setActiveInputTab('file')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeInputTab === 'file'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Documents (PDF, DOCX, TXT)</span>
          </button>

          <button
            onClick={() => setActiveInputTab('text')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeInputTab === 'text'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Direct Text / Lecture Notes</span>
          </button>
        </div>

        {/* Tab 1: Web URL */}
        {activeInputTab === 'url' && (
          <form onSubmit={handleScrapeUrl} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Globe className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="url"
                  placeholder="Paste any article or educational link (e.g., https://en.wikipedia.org/wiki/Distributed_computing)"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isScraping || !urlInput.trim()}
                className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all shrink-0"
              >
                {isScraping ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Scraping & Parsing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Scrape & Ingest</span>
                  </>
                )}
              </button>
            </div>
            {urlError && (
              <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{urlError}</span>
              </div>
            )}
            <p className="text-xs text-slate-500">
              PrepMatrix automatically strips ads, navigation bars, and headers, extracting only the high-value academic text.
            </p>
          </form>
        )}

        {/* Tab 2: File Upload */}
        {activeInputTab === 'file' && (
          <div className="space-y-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileUpload(e.dataTransfer.files);
              }}
              className="cursor-pointer border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-8 text-center transition-all bg-slate-950/30 hover:bg-slate-900/40 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.txt,.md"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="p-3 rounded-xl bg-indigo-600/10 group-hover:bg-indigo-600/20 text-indigo-400 transition-colors">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Click to browse or drag and drop documents
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports PDF, DOCX (Word), TXT, and Markdown files (up to 30MB)
                  </p>
                </div>
              </div>
            </div>

            {isUploading && (
              <div className="flex items-center gap-2 text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-2 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Extracting and parsing document contents...</span>
              </div>
            )}

            {uploadError && (
              <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Direct Text */}
        {activeInputTab === 'text' && (
          <form onSubmit={handleSaveText} className="space-y-3">
            <input
              type="text"
              placeholder="Document Title (e.g. Chapter 4: Photosynthesis & Calvin Cycle)"
              value={textTitle}
              onChange={(e) => setTextTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            <textarea
              rows={5}
              placeholder="Paste raw lecture notes, article excerpts, textbook sections, or research papers..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none resize-y"
              required
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSavingText || !textContent.trim()}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-5 py-2 text-sm font-semibold text-white shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Save to Library</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Document Library Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Your Source Documents</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              {documents.length} sources
            </span>
          </div>

          {documents.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={onSelectAllDocs}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
              >
                <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                <span>Select All</span>
              </button>
              <button
                onClick={onDeselectAllDocs}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
              >
                <Square className="w-3.5 h-3.5 text-slate-500" />
                <span>Deselect All</span>
              </button>
            </div>
          )}
        </div>

        {documents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-slate-500">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-slate-600" />
            <p className="text-sm font-medium text-slate-300">No documents ingested yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Paste an educational URL above or upload your PDF/Word documents to start generating study sets.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => {
              const isSelected = selectedDocIds.includes(doc.id);
              return (
                <div
                  key={doc.id}
                  className={`relative rounded-2xl border p-4 transition-all ${
                    isSelected
                      ? 'border-indigo-500/50 bg-indigo-950/20 shadow-md shadow-indigo-950/30'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => onToggleSelectDoc(doc.id)}
                        className="mt-0.5 text-slate-400 hover:text-indigo-400 transition-colors shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-indigo-400" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-600" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {doc.type}
                          </span>
                          <span className="text-xs text-slate-500">
                            {doc.wordCount.toLocaleString()} words
                          </span>
                        </div>
                        <h3 className="font-semibold text-white text-sm mt-1 truncate" title={doc.title}>
                          {doc.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        title="View Document Details"
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteDocument(doc.id)}
                        title="Delete Document"
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                    {doc.excerpt || doc.content.slice(0, 160)}
                  </p>

                  {doc.url && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-1 text-[11px] text-indigo-400 truncate">
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline truncate"
                      >
                        {doc.url}
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-base truncate max-w-md">
                  {previewDoc.title}
                </h3>
                <p className="text-xs text-slate-400">
                  {previewDoc.wordCount} words • Ingested as {previewDoc.type.toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            <div className="p-5 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap selection:bg-indigo-500/30">
              {previewDoc.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
