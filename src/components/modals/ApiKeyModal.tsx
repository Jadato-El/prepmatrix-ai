import React, { useState } from 'react';
import { Key, CheckCircle2, AlertCircle, Loader2, ExternalLink, Cpu, Shield } from 'lucide-react';
import { UserSettings } from '../../types/index.js';
import { ApiService } from '../../services/api.js';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (newSettings: UserSettings) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [apiKey, setApiKey] = useState(settings.geminiApiKey || '');
  const [selectedModel, setSelectedModel] = useState(settings.geminiModel || 'gemini-2.5-flash');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<{ valid?: boolean; message?: string } | null>(null);

  if (!isOpen) return null;

  const handleVerifyAndSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!apiKey.trim()) {
      // Clear key -> fallback mode
      onSaveSettings({ ...settings, geminiApiKey: '', geminiModel: selectedModel });
      setVerifyStatus({ valid: true, message: 'Saved with offline academic fallback mode.' });
      setTimeout(onClose, 800);
      return;
    }

    setIsVerifying(true);
    setVerifyStatus(null);

    const result = await ApiService.verifyGeminiKey(apiKey.trim(), selectedModel);
    setIsVerifying(false);

    if (result.valid) {
      setVerifyStatus({ valid: true, message: 'Key successfully authenticated with Google Gemini!' });
      onSaveSettings({
        ...settings,
        geminiApiKey: apiKey.trim(),
        geminiModel: selectedModel,
      });
      setTimeout(onClose, 1200);
    } else {
      setVerifyStatus({ valid: false, message: result.error || 'Invalid API Key.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">AI Engine Configuration</h3>
              <p className="text-xs text-slate-400">Google Gemini High-Standard Model Settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleVerifyAndSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your Gemini API key (AIzaSy...)"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none font-mono"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
              <span>Leave blank to use the smart academic offline generator.</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline flex items-center gap-1"
              >
                Get free key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select AI Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended: Ultra-fast & high intelligence)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep reasoning & complex synthesis)</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Lightweight)</option>
            </select>
          </div>

          {verifyStatus && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                verifyStatus.valid
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
              }`}
            >
              {verifyStatus.valid ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{verifyStatus.message}</span>
            </div>
          )}

          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-[11px] text-slate-400 flex items-start gap-2">
            <Shield className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              Your API key is stored locally in your browser's LocalStorage and is never shared with third parties.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isVerifying}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Key...</span>
                </>
              ) : (
                <span>Save Configuration</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
