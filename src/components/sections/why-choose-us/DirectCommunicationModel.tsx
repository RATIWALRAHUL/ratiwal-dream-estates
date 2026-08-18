"use client";

import React from "react";
import { ArrowRight, Building, Check, Layers, UserCheck } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";
import { whyChooseUsData } from "@/data/whyChooseUsData";

export function DirectCommunicationModel() {
  const { directCommunicationModel } = whyChooseUsData;

  const renderNodeIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return <Building className="w-6 h-6 text-[var(--ratwal-blue)]" />;
      case 1:
        return <Layers className="w-6 h-6 text-[var(--cyan)]" />;
      case 2:
      default:
        return <UserCheck className="w-6 h-6 text-[var(--ratwal-blue)]" />;
    }
  };

  return (
    <section
      className="py-16 sm:py-24 bg-white border-b border-[rgba(7,26,40,0.08)]"
      aria-labelledby="communication-model-title"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <Reveal>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ratwal-blue)] block mb-2">
              {directCommunicationModel.eyebrow}
            </span>
            <h2
              id="communication-model-title"
              className="font-instrument text-3xl sm:text-4xl md:text-5xl text-[var(--midnight)] font-normal leading-tight tracking-tight mb-4"
            >
              {directCommunicationModel.headline}
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-normal">
              {directCommunicationModel.lead}
            </p>
          </Reveal>
        </div>

        {/* 3-Node Architectural Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 relative mb-14">
          {directCommunicationModel.nodes.map((node, idx) => (
            <Reveal key={idx} delay={idx * 150}>
              <div className="relative p-7 sm:p-8 rounded-2xl sm:rounded-3xl bg-[var(--surface)] border border-[rgba(7,26,40,0.08)] h-full flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-white text-[var(--ratwal-blue)] flex items-center justify-center shadow-xs">
                      {renderNodeIcon(idx)}
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white border border-[rgba(7,26,40,0.08)] text-[11px] font-bold uppercase tracking-wider text-[var(--ratwal-blue)]">
                      {node.badge}
                    </span>
                  </div>

                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] block mb-1">
                    {node.role}
                  </span>

                  <h3 className="font-instrument text-2xl sm:text-3xl text-[var(--midnight)] font-normal mb-3">
                    {node.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-normal">
                    {node.desc}
                  </p>
                </div>

                {/* Right Arrow indicator on desktop between nodes */}
                {idx < 2 && (
                  <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border border-[rgba(7,26,40,0.1)] items-center justify-center text-[var(--ratwal-blue)] shadow-xs">
                    <ArrowRight size={14} />
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        {/* Diligence Points Matrix */}
        <Reveal delay={300}>
          <div className="p-6 sm:p-10 rounded-2xl sm:rounded-3xl bg-[var(--midnight)] text-white shadow-xl">
            <div className="max-w-2xl mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--cyan)] block mb-1">
                Transparency Principles
              </span>
              <h4 className="font-instrument text-2xl sm:text-3xl text-white font-normal">
                How our communication layer protects your decision:
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {directCommunicationModel.diligencePoints.map((point, pIdx) => (
                <div
                  key={pIdx}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10"
                >
                  <span className="w-5 h-5 rounded-full bg-[var(--ratwal-blue)] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={12} className="stroke-[3]" />
                  </span>
                  <p className="text-xs sm:text-[13px] text-white/90 leading-relaxed font-normal">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
