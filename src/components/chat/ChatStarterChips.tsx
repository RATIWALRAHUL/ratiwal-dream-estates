"use client";

import React from "react";
import { ShieldCheck, Compass, Scale, Ruler, Banknote, Calendar } from "lucide-react";

interface ChatStarterChipsProps {
  onSelectPrompt: (prompt: string) => void;
}

const STARTER_PROMPTS = [
  { icon: Compass, label: "Explore Jaipur Townships", prompt: "Show me all verified townships and plot developments in Jaipur." },
  { icon: Banknote, label: "Find Projects by Budget", prompt: "What are the price ranges for residential plots in your portfolio?" },
  { icon: Scale, label: "Compare Projects", prompt: "Compare Neelkanth Nagar and Riyasat Paradise II." },
  { icon: Ruler, label: "Check Plot Sizes", prompt: "What are the smallest and largest plot sizes available across your projects?" },
  { icon: Calendar, label: "Arrange a Site Visit", prompt: "I would like to schedule a free site visit this weekend." },
  { icon: ShieldCheck, label: "RERA & JDA Approvals", prompt: "How do you verify legal titles and RERA approvals for plots?" },
];

export function ChatStarterChips({ onSelectPrompt }: ChatStarterChipsProps) {
  return (
    <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 border-t border-slate-100">
      <div className="w-full text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
        Suggested questions
      </div>
      {STARTER_PROMPTS.map((item, idx) => {
        const Icon = item.icon;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(item.prompt)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white border border-slate-200/90 hover:border-[#087fc3] hover:bg-sky-50/50 text-slate-700 hover:text-[#087fc3] text-[11px] font-medium transition-all shadow-2xs text-left cursor-pointer active:scale-95"
          >
            <Icon size={12} className="text-[#087fc3] shrink-0" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
