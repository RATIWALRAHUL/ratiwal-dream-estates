"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  MessageSquare,
  X,
  Send,
  RotateCcw,
  Bot,
  AlertCircle,
  ExternalLink,
  MessageCircle,
  ChevronDown,
  Minimize2,
} from "lucide-react";
import { ChatStarterChips } from "./ChatStarterChips";
import { ChatProjectCard, type ProjectCardData } from "./ChatProjectCard";
import { ChatMessageContent } from "./ChatMessageContent";
import { cn } from "@/lib/utils";
import { generateWhatsAppUrl } from "@/lib/whatsapp";

interface MessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  projectCards?: ProjectCardData[];
  referenceNumber?: string;
  isError?: boolean;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! Welcome to Ratiwal Dream Estates. How can I assist you with verified residential plots, township developments, or scheduling a site visit across Jaipur, Ajmer, or Kishangarh?",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      if (!isMinimized) {
        setTimeout(() => inputRef.current?.focus(), 150);
      }
    }
  }, [isOpen, messages, isMinimized]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const userText = (textToSend || input).trim();
    if (!userText || isLoading) return;

    setInput("");
    setStatusText(null);
    const userMsgId = `user-${Date.now()}`;
    const assistantMsgId = `asst-${Date.now()}`;

    const newMessages: MessageItem[] = [
      ...messages,
      { id: userMsgId, role: "user", content: userText },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    // Cancel any previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Build history for API
      const apiPayload = newMessages
        .filter((m) => !m.isError)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await fetch("/api/chat?stream=true", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/event-stream",
        },
        body: JSON.stringify({ messages: apiPayload }),
        signal: controller.signal,
      });

      if (!res.ok) {
        let errReply = "I encountered a temporary connection issue. Please tap retry or ask again.";
        try {
          const errJson = await res.json();
          if (errJson?.reply || errJson?.error) errReply = errJson.reply || errJson.error;
        } catch {
          // Ignore
        }
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: errReply,
            isError: true,
          },
        ]);
        return;
      }

      // Check if response is SSE stream
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("text/event-stream") && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulatedReply = "";
        let hasAppendedAssistant = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine.startsWith("data: ")) continue;
            const dataStr = trimmedLine.slice(6);
            if (!dataStr) continue;

            try {
              const event = JSON.parse(dataStr);

              if (event.type === "status") {
                setStatusText(event.message);
              } else if (event.type === "token") {
                setStatusText(null);
                accumulatedReply += event.content;

                if (!hasAppendedAssistant) {
                  hasAppendedAssistant = true;
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: assistantMsgId,
                      role: "assistant",
                      content: accumulatedReply,
                    },
                  ]);
                } else {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMsgId
                        ? { ...m, content: accumulatedReply }
                        : m
                    )
                  );
                }
              } else if (event.type === "cards") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, projectCards: event.projectCards }
                      : m
                  )
                );
              } else if (event.type === "ref") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, referenceNumber: event.referenceNumber }
                      : m
                  )
                );
              } else if (event.type === "done") {
                setStatusText(null);
                if (!hasAppendedAssistant) {
                  hasAppendedAssistant = true;
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: assistantMsgId,
                      role: "assistant",
                      content: event.fullReply || accumulatedReply,
                      projectCards: event.projectCards,
                      referenceNumber: event.referenceNumber,
                    },
                  ]);
                } else {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMsgId
                        ? {
                            ...m,
                            content: event.fullReply || accumulatedReply,
                            projectCards: event.projectCards || m.projectCards,
                            referenceNumber: event.referenceNumber || m.referenceNumber,
                          }
                        : m
                    )
                  );
                }
              } else if (event.type === "error") {
                setStatusText(null);
                setMessages((prev) => [
                  ...prev,
                  {
                    id: `err-${Date.now()}`,
                    role: "assistant",
                    content: event.reply || event.error || "A temporary issue occurred.",
                    isError: true,
                  },
                ]);
              }
            } catch {
              // Ignore JSON parse errors in malformed stream chunks
            }
          }
        }
      } else {
        // Fallback for standard JSON response
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMsgId,
            role: "assistant",
            content: data.reply,
            projectCards: data.projectCards,
            referenceNumber: data.referenceNumber,
            isError: !data.success,
          },
        ]);
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            "Network connection failed. Please check your connection and tap retry.",
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      setStatusText(null);
      abortControllerRef.current = null;
    }
  };

  const handleResetConversation = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content:
          "Conversation restarted. Ask me anything about our verified plot developments, JDA/RERA titles, or arrange a personal site visit.",
      },
    ]);
  };

  const handleRetryLastMessage = () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.content);
    }
  };

  const whatsappUrl = generateWhatsAppUrl({ type: "general" });

  return (
    <>
      {/* Floating Robot Launcher Button */}
      <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center">
        {!isOpen && (
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className={cn(
              "relative w-13 h-13 sm:w-14 sm:h-14 rounded-full",
              "bg-[#071a28] hover:bg-[#0c2f49] text-white shadow-xl hover:shadow-2xl border border-sky-400/30",
              "flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer focus-visible:outline"
            )}
            aria-label="Open Property Advisor"
            title="Chat with Property Advisor"
          >
            <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-sky-400" />
            <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-[#071a28]" />
          </button>
        )}
      </div>

      {/* Compact Chat Window (Standard Intercom / Crisp Style) */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Ratiwal Property Advisor"
          className={cn(
            "fixed z-50 flex flex-col bg-white border border-slate-200/90 shadow-2xl overflow-hidden transition-all duration-200",
            // Compact standard sizing: 350-365px width, 480-500px height
            isMinimized
              ? "bottom-5 right-4 sm:right-6 w-[280px] h-12 rounded-xl"
              : "bottom-4 right-3 left-3 sm:left-auto sm:bottom-6 sm:right-6 sm:w-[365px] h-[480px] sm:h-[500px] max-h-[calc(100dvh-50px)] rounded-2xl"
          )}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#071a28] text-white shrink-0 border-b border-sky-900/40">
            <div className="flex items-center gap-2">
              <div className="relative w-7.5 h-7.5 rounded-full bg-gradient-to-tr from-[#087fc3] to-[#42b7e8] flex items-center justify-center text-white shrink-0 shadow-xs">
                <Bot size={16} />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#071a28]" />
              </div>
              <div className="text-left">
                <h3 className="text-xs font-bold leading-tight text-white">
                  Ratiwal Property Advisor
                </h3>
                <p className="text-[9.5px] text-slate-300 leading-tight">
                  Verified Database • Online
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-0.5 text-slate-300">
              <button
                type="button"
                onClick={handleResetConversation}
                className="p-1 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
                title="Reset conversation"
                aria-label="Reset conversation"
              >
                <RotateCcw size={13} />
              </button>

              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="hidden sm:inline-flex p-1 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
                title={isMinimized ? "Expand chat" : "Minimize chat"}
                aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
              >
                <Minimize2 size={13} />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
                title="Close chat"
                aria-label="Close chat"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* WhatsApp Fast Strip */}
              <div className="px-3 py-1.5 bg-emerald-50/80 border-b border-emerald-100/80 flex items-center justify-between text-[11px] text-emerald-900">
                <span className="flex items-center gap-1.5 font-medium">
                  <MessageCircle size={13} className="text-[#25D366] fill-[#25D366]/20" />
                  <span>Need human consultation?</span>
                </span>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#128C7E] hover:underline inline-flex items-center gap-0.5"
                >
                  <span>Chat with Suresh Ratiwal</span>
                  <ExternalLink size={10} />
                </a>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-[#fbfdfa]">
                {messages.map((msg) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={msg.id}
                      className={cn("flex flex-col gap-2", isUser ? "items-end" : "items-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed text-left",
                          isUser
                            ? "bg-[#087fc3] text-white rounded-br-xs shadow-xs"
                            : msg.isError
                            ? "bg-rose-50 text-rose-900 border border-rose-200 rounded-bl-xs"
                            : "bg-white text-slate-800 border border-slate-200/80 shadow-2xs rounded-bl-xs"
                        )}
                      >
                        {msg.isError && (
                          <div className="flex items-center gap-1 text-rose-600 font-bold mb-1">
                            <AlertCircle size={12} />
                            <span>System Note</span>
                          </div>
                        )}
                        {isUser ? (
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        ) : (
                          <ChatMessageContent content={msg.content} />
                        )}

                        {msg.referenceNumber && (
                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between font-mono text-[10px] text-[#087fc3]">
                            <span>Ref: {msg.referenceNumber}</span>
                            <span className="font-sans text-[9px] uppercase text-emerald-600 font-bold">Saved in CRM</span>
                          </div>
                        )}
                      </div>

                      {/* Render attached Project Cards if available */}
                      {msg.projectCards && msg.projectCards.length > 0 && (
                        <div className="w-full flex gap-2.5 overflow-x-auto py-1 px-0.5 snap-x snap-mandatory scrollbar-thin">
                          {msg.projectCards.map((proj) => (
                            <ChatProjectCard
                              key={proj.slug}
                              project={proj}
                              onSelectAction={(prompt) => handleSendMessage(prompt)}
                            />
                          ))}
                        </div>
                      )}

                      {/* Error retry button */}
                      {msg.isError && (
                        <button
                          type="button"
                          onClick={handleRetryLastMessage}
                          className="text-[10px] font-bold text-[#087fc3] hover:underline self-start flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw size={10} />
                          <span>Tap here to retry</span>
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* Loading typing bubble */}
                {isLoading && (
                  <div className="flex items-start gap-2 self-start animate-fade-in">
                    <div className="bg-white border border-slate-200/90 px-3.5 py-2.5 rounded-2xl rounded-bl-xs shadow-2xs flex items-center gap-1.5 text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#087fc3] animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#087fc3] animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#087fc3] animate-bounce" />
                      <span className="text-[10px] font-medium text-slate-600 ml-1">
                        {statusText || "Consulting verified database..."}
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Starter chips when message history is brief */}
              {messages.length <= 2 && (
                <ChatStarterChips onSelectPrompt={(prompt) => handleSendMessage(prompt)} />
              )}

              {/* Input Area */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-white border-t border-slate-200/90 flex items-center gap-2 shrink-0"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about Jaipur plots, prices, site visits..."
                  disabled={isLoading}
                  className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#087fc3] focus:bg-white transition-all disabled:opacity-50"
                />

                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="w-8 h-8 rounded-xl bg-[#087fc3] hover:bg-[#0a6ba3] disabled:bg-slate-200 text-white disabled:text-slate-400 flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
                  aria-label="Send message"
                >
                  <Send size={14} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
