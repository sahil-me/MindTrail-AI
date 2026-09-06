import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  User,
  ArrowLeft,
  Copy,
  Check,
  Calendar,
  Tag,
  Download,
  RotateCcw,
  MapPin,
} from 'lucide-react';
import { JournalEntry, ReflectionMode } from '../types';
import { getEntryDisplayTimestamp } from '../utils/dateUtils';

interface ConversationThreadProps {
  entry: JournalEntry;
  onSendFollowUp: (text: string, mode?: ReflectionMode) => Promise<void>;
  isResponding: boolean;
  onBack: () => void;
}

export const ConversationThread: React.FC<ConversationThreadProps> = ({
  entry,
  onSendFollowUp,
  isResponding,
  onBack,
}) => {
  const [followUpText, setFollowUpText] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [entry.messages, isResponding]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!followUpText.trim() || isResponding) return;
    const text = followUpText.trim();
    setFollowUpText('');
    await onSendFollowUp(text, 'chat');
  };

  const handleQuickFollowUp = async (prompt: string, mode?: ReflectionMode) => {
    if (isResponding) return;
    await onSendFollowUp(prompt, mode);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleExport = () => {
    const content = `# ${entry.title}
Date: ${new Date(entry.createdAt).toLocaleString()}
Mood/Theme: ${entry.mood}

## Original Reflection
${entry.originalJournal}

## Conversation with Gemini
${entry.messages
  .map(
    (m) =>
      `### ${m.sender === 'user' ? 'You' : 'Gemini'} (${new Date(m.timestamp).toLocaleTimeString()}):\n${m.text}\n`
  )
  .join('\n')}
`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${entry.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_reflection.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="conversation-thread-view" className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-stone-200 dark:border-stone-800">
        <button
          id="btn-back-to-entries"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Reflections</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-export-entry"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8E5DE] dark:border-[#2B2A27] bg-[#FFFDF8] dark:bg-[#1E1D1B] text-xs font-medium text-[#171817] dark:text-[#F6F4EE] hover:bg-[#F2EFE8] dark:hover:bg-[#282724] transition-colors cursor-pointer shadow-2xs"
            title="Download reflection as Markdown file"
          >
            <Download className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
            <span>Export Markdown</span>
          </button>
        </div>
      </div>

      {/* Entry header card */}
      <div
        id="entry-header-card"
        className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-xs"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              id="entry-mood-badge"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-900/80"
            >
              <Tag className="w-3 h-3 text-amber-700 dark:text-amber-400" />
              {entry.mood}
            </span>

            {entry.location?.name && (
              <span
                id="entry-location-badge"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FAF6ED] dark:bg-[#2A2418] text-[#C5A45D] dark:text-[#D4B774] border border-[#E6D8B5] dark:border-[#423924]"
                title={entry.location.address || entry.location.name}
              >
                <MapPin className="w-3 h-3 text-[#C5A45D] dark:text-[#D4B774]" />
                <span>{entry.location.name}</span>
              </span>
            )}

            <span
              id="entry-created-timestamp"
              className="inline-flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300 font-medium"
            >
              <Calendar className="w-3.5 h-3.5 text-[#C5A45D] dark:text-[#D4B774]" />
              <span>{getEntryDisplayTimestamp(entry)}</span>
            </span>
          </div>

          <div className="text-[11px] font-medium text-stone-400 dark:text-stone-500">
            {entry.messages.length} interaction{entry.messages.length !== 1 ? 's' : ''}
          </div>
        </div>

        <h1
          id="entry-main-title"
          className="font-serif-title text-2xl sm:text-3xl font-semibold text-stone-900 dark:text-stone-100 mb-4"
        >
          {entry.title}
        </h1>

        {/* Original Journal Text */}
        <div
          id="entry-original-journal"
          className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-800 text-sm text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-wrap font-sans"
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
            Original Journal Entry
          </div>
          {entry.originalJournal}
        </div>
      </div>

      {/* Messages Stream */}
      <div id="messages-stream" className="space-y-4 pt-2">
        {entry.messages.map((message) => {
          const isUser = message.sender === 'user';
          return (
            <div
              key={message.id}
              id={`message-bubble-${message.id}`}
              className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-800 dark:text-amber-200 shrink-0 shadow-2xs mt-1">
                  <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-stone-900 dark:bg-amber-700 text-stone-100 rounded-tr-xs'
                    : 'bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 text-stone-900 dark:text-stone-100 rounded-tl-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className={isUser ? 'text-stone-300 font-medium' : 'text-stone-700 dark:text-stone-300 font-medium'}>
                      {isUser ? 'You' : 'Gemini AI'}
                    </span>
                    {!isUser && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60 font-mono">
                        {message.modelUsed || 'gemini-3.6-flash'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] ${isUser ? 'text-stone-400' : 'text-stone-400 dark:text-stone-500'}`}>
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopy(message.text, message.id)}
                        className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors rounded cursor-pointer ml-1"
                        title="Copy text"
                      >
                        {copiedMessageId === message.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Message Content with Markdown rendering */}
                <div className="whitespace-pre-wrap break-words leading-relaxed">
                  {message.text}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-stone-700 dark:text-stone-300 shrink-0 shadow-2xs mt-1">
                  <User className="w-4 h-4 text-stone-600 dark:text-stone-300" />
                </div>
              )}
            </div>
          );
        })}

        {/* Responding indicator */}
        {isResponding && (
          <div id="gemini-thinking-indicator" className="flex gap-3 items-center text-stone-500 dark:text-stone-400 text-xs">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-800 dark:text-amber-200 shrink-0">
              <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-400 animate-spin" />
            </div>
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl px-4 py-3 shadow-xs flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-stone-600 dark:text-stone-300 font-medium">Gemini is reflecting...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Follow-ups */}
      <div className="pt-2">
        <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-2">
          <RotateCcw className="w-3 h-3 text-stone-400 dark:text-stone-500" />
          <span>Quick follow-up prompts:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleQuickFollowUp('What alternative perspectives or cognitive blind spots might I be missing here?')}
            disabled={isResponding}
            className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-850 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            "What blind spots might I be missing?"
          </button>
          <button
            type="button"
            onClick={() => handleQuickFollowUp('Can you distill this conversation into 3 concrete, low-friction next actions?')}
            disabled={isResponding}
            className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-850 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            "Distill into 3 concrete next actions"
          </button>
          <button
            type="button"
            onClick={() => handleQuickFollowUp('Give me a grounding affirmation or perspective to carry forward today.')}
            disabled={isResponding}
            className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-850 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            "Give me a grounding affirmation"
          </button>
        </div>
      </div>

      {/* Follow-up input form */}
      <div
        id="follow-up-input-container"
        className="sticky bottom-4 z-20 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md p-3 shadow-md"
      >
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            id="input-follow-up-text"
            type="text"
            value={followUpText}
            onChange={(e) => setFollowUpText(e.target.value)}
            placeholder="Ask a follow-up, share deeper thoughts, or request next steps..."
            disabled={isResponding}
            className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 placeholder:text-stone-400 dark:placeholder:text-stone-500"
          />
          <button
            id="btn-send-follow-up"
            type="submit"
            disabled={isResponding || !followUpText.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-900 dark:bg-amber-600 text-white hover:bg-stone-800 dark:hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs sm:text-sm font-medium cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
