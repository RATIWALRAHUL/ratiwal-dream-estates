"use client";

import React, { useState } from "react";
import Link from "next/link";
import { saveFaqAction } from "@/lib/actions/cms.actions";
import { ArrowLeft, Plus, HelpCircle, CheckCircle2 } from "lucide-react";

interface FaqItem {
  _id: string;
  category: string;
  question: string;
  answerHtml: string;
  plainTextAnswer: string;
  status: string;
}

interface CmsFaqManagerViewProps {
  initialFaqs: FaqItem[];
}

export function CmsFaqManagerView({ initialFaqs }: CmsFaqManagerViewProps) {
  const [faqs] = useState(initialFaqs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("category", category);
    formData.append("question", question);
    formData.append("answerHtml", answer);
    formData.append("plainTextAnswer", answer);

    await saveFaqAction(formData);
    setIsSubmitting(false);
    setIsModalOpen(false);
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/content"
            className="inline-flex items-center gap-1 text-xs text-[#647581] hover:text-[#071a28] mb-1 transition font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to CMS Overview</span>
          </Link>
          <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#071a28]">
            FAQs & Knowledge Base
          </h1>
          <p className="text-xs md:text-sm text-[#647581] mt-1">
            Categorized frequently asked questions for buyers, investors, and legal due diligence.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0088cc] hover:bg-[#0077b5] rounded-xl shadow-xs transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New FAQ</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {faqs.map((f) => (
          <div
            key={f._id}
            className="p-5 rounded-3xl border border-[rgba(7,26,40,0.08)] bg-white shadow-[0_4px_20px_rgba(7,26,40,0.02)] space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#0088cc] uppercase tracking-wider bg-[#eaf5fa] px-2.5 py-1 rounded-full border border-[#0088cc]/20">
                {f.category.replace(/_/g, " ")}
              </span>
              <span className="text-[10px] font-mono text-[#647581] font-bold">{f.status}</span>
            </div>
            <h3 className="font-serif text-base font-bold text-[#071a28]">
              {f.question}
            </h3>
            <p className="text-xs text-[#647581] line-clamp-3 leading-relaxed">
              {f.plainTextAnswer}
            </p>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl border border-[rgba(7,26,40,0.12)] bg-white shadow-2xl p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#071a28]">
              Add FAQ
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#071a28] mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28]"
                >
                  {["GENERAL", "BUYING_PROCESS", "SITE_VISITS", "BOOKING", "KYC", "PAYMENTS", "REFUNDS", "LEGAL", "PROPERTIES", "LOCATIONS"].map((c) => (
                    <option key={c} value={c}>
                      {c.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#071a28] mb-1">
                  Question
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. What documents are required for JDA plot registration?"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#071a28] mb-1">
                  Answer
                </label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={4}
                  placeholder="Comprehensive, truthful explanation..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[rgba(7,26,40,0.06)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#647581] hover:text-[#071a28]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4.5 py-2 text-xs font-semibold text-white bg-[#0088cc] hover:bg-[#0077b5] rounded-xl"
                >
                  {isSubmitting ? "Saving..." : "Save FAQ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
