"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare, Sparkles, ChevronRight, ChevronLeft } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function NovaSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content || data.error || "Sorry, I couldn't process that.",
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Oops! Something went wrong. Please try again. 🔮",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button (Hidden on mobile to prevent overlap) */}
      <button
        onClick={toggleSidebar}
        className={`hidden md:block fixed right-0 top-[65%] -translate-y-1/2 z-40 bg-white border-y border-l border-[#A1E3F9] p-2 rounded-l-xl shadow-lg hover:bg-[#D1F8EF] transition-all ${
          isOpen ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
        }`}
      >
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#3674B5]">
            <img src="/onboarding/nova-icon.png" alt="Nova" className="w-full h-full object-cover" />
          </div>
          <span className="text-[10px] font-heading text-[#3674B5] writing-vertical">NOVA</span>
          <ChevronLeft size={16} className="text-[#3674B5]" />
        </div>
      </button>

      {/* Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-80 md:w-96 bg-white border-l border-[#A1E3F9] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-[#A1E3F9] bg-gradient-to-r from-[#D1F8EF] to-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden relative">
                   <img src="/onboarding/nova-icon.png" alt="Nova" className="w-full h-full object-cover" />
                   <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="font-heading text-[#3674B5]">Nova Guardian</h3>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Sparkles size={10} className="text-amber-500" />
                    AI Market Analyst
                  </div>
                </div>
              </div>
              <button 
                onClick={toggleSidebar}
                className="p-1 hover:bg-white/50 rounded-full transition-colors text-gray-500"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">

              {messages.length === 0 && (
                <div className="text-center mt-10 opacity-60">
                  <div className="w-16 h-16 mx-auto mb-3 bg-[#A1E3F9]/30 rounded-full flex items-center justify-center">
                    <MessageSquare size={24} className="text-[#3674B5]" />
                  </div>
                  <p className="text-sm text-gray-500">
                    Hi! I'm Nova. Ask me about trending creators, market strategies, or just say hello! 👋
                  </p>
                </div>
              )}

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                      m.role === "user"
                        ? "bg-[#3674B5] text-white rounded-br-none"
                        : "bg-white border border-[#A1E3F9] text-gray-700 rounded-bl-none shadow-sm"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-[#A1E3F9] rounded-2xl rounded-bl-none p-3 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[#3674B5] rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-[#3674B5] rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-[#3674B5] rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-[#A1E3F9] bg-white">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Nova..."
                  className="flex-1 bg-gray-50 border border-[#A1E3F9] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#3674B5] transition-colors"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-2 bg-[#3674B5] text-white rounded-xl hover:bg-[#2A598A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
