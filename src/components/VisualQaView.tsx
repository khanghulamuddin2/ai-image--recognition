import React, { useState } from "react";
import {
  MessageSquareCode,
  Send,
  Sparkles,
  Bot,
  User,
  HelpCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { DetectedObject } from "../types/vision";

interface VisualQaViewProps {
  imageSrc: string;
  detectedObjects: DetectedObject[];
}

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export const VisualQaView: React.FC<VisualQaViewProps> = ({
  imageSrc,
  detectedObjects,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m_welcome",
      sender: "ai",
      text: `Hello! I am your AI Vision Intelligence Analyst. I have localized and cataloged ${detectedObjects.length} entities in this frame. What specific details, counts, spatial arrangements, or visual aspects would you like me to inspect?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isAsking, setIsAsking] = useState(false);

  const suggestedQuestions = [
    "How many distinct vehicles and pedestrians are visible?",
    "Describe the exact lighting conditions, weather, and time of day.",
    "Are there any safety hazards, obstacles, or anomalous objects?",
    "Can you read and transcribe any visible signs, logos, or plates?",
    "Describe the spatial layout and relative distance between key subjects.",
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const q = (textToSend || inputText).trim();
    if (!q || isAsking) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsAsking(true);

    try {
      const res = await fetch("/api/vision/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageSrc,
          question: q,
          detectedObjects,
        }),
      });

      const data = await res.json();
      const aiReply: Message = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: data.answer || "Unable to extract answer for that query.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        sender: "ai",
        text: "Error connecting to vision intelligence service. Please verify server connection.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <MessageSquareCode className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Visual Question Answering & Deep Interrogation
            </h3>
            <p className="text-xs text-slate-400">
              Query spatial relationships, counting, OCR, and hidden details grounded in the image
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-800/50">
          Context: {detectedObjects.length} Objects Cataloged
        </div>
      </div>

      {/* Suggested Questions */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          Quick Question Templates
        </span>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(sq)}
              disabled={isAsking}
              className="text-xs text-left px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-800/80 transition-colors disabled:opacity-50"
            >
              "{sq}"
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="bg-slate-950/80 rounded-xl border border-slate-800/80 p-4 h-[380px] overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${
              m.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                m.sender === "user"
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              }`}
            >
              {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[80%] rounded-xl p-3 text-xs leading-relaxed ${
                m.sender === "user"
                  ? "bg-cyan-950/70 border border-cyan-800/60 text-slate-100"
                  : "bg-slate-900 border border-slate-800 text-slate-200"
              }`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>
              <span className="block text-[10px] text-slate-500 font-mono mt-1 text-right">
                {m.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isAsking && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-cyan-300 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Inspecting visual field & evaluating prompt...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask a question about colors, counts, actions, or specific coordinates in the image..."
          disabled={isAsking}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isAsking}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono"
        >
          {isAsking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
