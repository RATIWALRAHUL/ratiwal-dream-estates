"use client";

import { useState } from "react";
import { Mail, MessageSquare, Code2, Eye, ShieldCheck } from "lucide-react";
import { NotificationTemplateItem } from "@/types/communication";

interface TemplateViewerProps {
  templates: NotificationTemplateItem[];
}

export function TemplateViewer({ templates }: TemplateViewerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplateItem | null>(templates[0] || null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Template Directory List */}
      <div className="space-y-2 lg:col-span-1">
        <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-[#647581] mb-3">
          Configured Templates ({templates.length})
        </h2>

        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {templates.map((t) => {
            const isSelected = selectedTemplate?.key === t.key && selectedTemplate?.channel === t.channel;
            return (
              <button
                key={`${t.key}:${t.channel}`}
                type="button"
                onClick={() => setSelectedTemplate(t)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                  isSelected
                    ? "bg-[#071a28] text-white border-[#071a28] shadow-md"
                    : "bg-white text-[#071a28] border-[rgba(7,26,40,0.08)] hover:bg-[#f8f7f4]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                    isSelected ? "text-[#42b7e8]" : "text-[#087fc3]"
                  }`}>
                    {t.channel === "EMAIL" ? <Mail className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                    <span>{t.channel}</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                    isSelected ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700"
                  }`}>
                    v{t.version}
                  </span>
                </div>
                <p className="text-xs font-bold mt-1.5 truncate">{t.key}</p>
                <p className={`text-[10px] line-clamp-1 mt-0.5 ${isSelected ? "text-slate-300" : "text-[#647581]"}`}>
                  {t.previewText}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Template Preview Panel */}
      <div className="lg:col-span-2">
        {selectedTemplate ? (
          <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(7,26,40,0.06)]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold">
                  {selectedTemplate.channel} TEMPLATE SPECIFICATION
                </span>
                <h3 className="text-xl font-bold font-serif text-[#071a28] mt-0.5">
                  {selectedTemplate.key}
                </h3>
              </div>

              {selectedTemplate.whatsappStatus && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Meta Status: {selectedTemplate.whatsappStatus}</span>
                </div>
              )}
            </div>

            {/* Subject Line & Purpose */}
            <div className="p-4 rounded-xl bg-[#f8f7f4] border border-[rgba(7,26,40,0.06)] space-y-2 text-xs">
              {selectedTemplate.subject && (
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#647581] block">Subject Line</span>
                  <span className="font-semibold text-[#071a28]">{selectedTemplate.subject}</span>
                </div>
              )}
              <div>
                <span className="text-[10px] font-mono uppercase text-[#647581] block">Purpose</span>
                <span className="font-mono text-[#071a28]">{selectedTemplate.purpose} (No promotional/marketing copy)</span>
              </div>
            </div>

            {/* Allowed Dynamic Variables */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#071a28] flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-[#087fc3]" />
                <span>Allowed Dynamic Template Variables</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedTemplate.allowedVariables.map((v) => (
                  <span
                    key={v}
                    className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 font-mono text-[11px] font-semibold"
                  >
                    {"{{"} {v} {"}}"}
                  </span>
                ))}
              </div>
            </div>

            {/* Rendered Mock Preview */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#071a28] flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#087fc3]" />
                <span>Rendered Message Content Preview</span>
              </h4>

              {selectedTemplate.channel === "EMAIL" ? (
                <div className="p-6 rounded-2xl bg-[#f4f3ee] border border-[rgba(7,26,40,0.08)]">
                  <div className="bg-white rounded-xl shadow-xs overflow-hidden border border-slate-200 max-w-lg mx-auto">
                    <div className="bg-[#071a28] p-4 text-center border-b-2 border-[#087fc3]">
                      <span className="text-white font-serif font-bold text-sm tracking-wider">RATIWAL DREAM ESTATES</span>
                    </div>
                    <div className="p-6 text-xs text-[#2b3a42] space-y-3 leading-relaxed">
                      <p className="font-serif font-bold text-sm text-[#071a28]">Dear Valued Client,</p>
                      <p>{selectedTemplate.previewText}</p>
                      <div className="p-3 bg-[#f8f7f4] rounded-lg border border-slate-100 font-mono text-[11px] space-y-1">
                        <p>Reference: <strong className="text-[#071a28]">RDE-SV-8M4K2P</strong></p>
                        <p>Property: <strong>Royal Palms Township, Ajmer Road</strong></p>
                      </div>
                      <p className="text-[11px] text-[#647581] pt-2">The Advisory Team · Ratiwal Dream Estates</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-[#e5ddd5] max-w-md mx-auto">
                  <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2 text-xs border border-slate-200">
                    <p className="font-semibold text-[#071a28]">
                      Namaste Vikram Sharma, your {selectedTemplate.key.replace(/_/g, " ")} is confirmed for Royal Palms Township.
                    </p>
                    <p className="text-[10px] text-[#647581] italic">
                      Advisor Helpline: +91 98765 43210 (Ref: RDE-SV-8M4K2P)
                    </p>
                    <div className="text-right text-[9px] text-slate-400 font-mono">11:00 AM ✓✓</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-[#647581] bg-white rounded-2xl border border-[rgba(7,26,40,0.08)]">
            Select a template from the left directory to inspect its parameters.
          </div>
        )}
      </div>
    </div>
  );
}
