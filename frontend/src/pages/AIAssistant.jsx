import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  RefreshCw,
  FileText,
  ShieldAlert,
  HelpCircle,
  CheckCircle2,
  Building,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';

export default function AIAssistant({ initialPrompt }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I am **SafePlate AI Intelligence**, your public health food safety assistant.
I am grounded in live inspection records, active violation logs, and predictive risk scoring algorithms.

You can ask me questions such as:
• **"Why is Central Spice Restaurant high risk?"**
• **"Summarize Central Spice's inspection history"**
• **"Explain the dynamic risk recalculation formula"**
• **"Which facilities are overdue for audits?"**

How can I assist your food safety operations today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState(initialPrompt || '');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.sendChatMessage(query, 1);
      if (res.success) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: res.response,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `I encountered an issue retrieving that information: ${err.message}. Please verify the backend service is running.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "Why is Central Spice Restaurant high risk?",
    "Summarize Central Spice's inspection history",
    "How does the risk recalculation formula work?",
    "Show overdue inspections and high risk restaurants",
    "Generate pre-inspection briefing for Central Spice"
  ];

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">SafePlate GenAI Assistant</h1>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono font-bold">
                Grounded Knowledge Base
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Direct access to inspection logs, risk indexing weights, and statutory remediation protocols.
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-2">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-800/80 border border-slate-700/80 text-slate-200 rounded-tl-none whitespace-pre-line'
                }`}
              >
                {msg.content}
                <div className={`mt-2 text-[10px] ${isUser ? 'text-cyan-200' : 'text-slate-400'} text-right`}>
                  {msg.timestamp}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-700 text-slate-200 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 text-xs text-cyan-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>Querying SafePlate knowledge base & synthesizing grounded risk analysis...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Controls: Prompt Suggestion Chips & Input */}
      <div className="pt-3 border-t border-slate-800 shrink-0 space-y-3">
        {/* Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
          {samplePrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium border border-slate-700 whitespace-nowrap transition-colors flex items-center gap-1"
            >
              <span>{prompt}</span>
              <ArrowRight className="w-3 h-3 text-cyan-400" />
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-slate-850 bg-slate-800 border border-slate-700 rounded-2xl p-1.5 focus-within:border-cyan-500 transition-colors shadow-lg"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about restaurant histories, risk calculations, or public health guidelines..."
            className="flex-1 bg-transparent px-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
