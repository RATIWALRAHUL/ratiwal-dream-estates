"use client";

import React from "react";
import { CountUp } from "@/components/home/CountUp";
import { Reveal } from "@/components/home/Reveal";
import { ShieldCheck, Award, Users, Building } from "lucide-react";

export function AboutMilestones() {
  const stats = [
    {
      end: 10,
      suffix: "+",
      label: "Years of Advisory Legacy",
      subtext: "Guiding clients through market cycles with consistent discipline.",
      icon: Award,
    },
    {
      end: 1000,
      suffix: "+",
      label: "Families & Investors Advised",
      subtext: "Helping private clients secure verified land without anxiety.",
      icon: Users,
    },
    {
      end: 500,
      suffix: "+",
      label: "Vetted Land Parcels",
      subtext: "Strictly filtered and physically demarcated plots.",
      icon: Building,
    },
    {
      end: 100,
      suffix: "%",
      label: "Clear Title Assurance",
      subtext: "Unblemished track record in 30-year revenue compliance.",
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="py-14 sm:py-18 bg-[var(--midnight)] text-white relative overflow-hidden" aria-labelledby="milestones-title">
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[radial-gradient(circle,rgba(66,183,232,0.25),transparent_70%)] blur-3xl" />
      </div>

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-14">
          <Reveal>
            <span className="text-[12px] font-bold tracking-[0.16em] uppercase text-[var(--cyan)]">
              PROVEN TRACK RECORD
            </span>
            <h2
              id="milestones-title"
              className="font-instrument text-[2.4rem] sm:text-[3.2rem] md:text-[3.6rem] text-white font-normal leading-[1.05] tracking-tight mt-2 mb-4"
            >
              Numbers that reflect our{" "}
              <span className="italic text-[var(--cyan)]">commitment.</span>
            </h2>
            <p className="text-white/70 text-base sm:text-lg">
              Behind every metric is a real family, investor, or entrepreneur whose capital was safely anchored into prime land.
            </p>
          </Reveal>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item, idx) => (
            <Reveal key={idx} delay={idx * 75}>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-white/20 transition-all duration-300 flex flex-col justify-between h-full">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[var(--ratiwal-blue)]/30 text-[var(--cyan)] flex items-center justify-center mb-4">
                    <item.icon size={20} />
                  </div>

                  <div className="font-instrument text-4xl sm:text-5xl font-normal text-white mb-2 tracking-tight">
                    <CountUp end={item.end} suffix={item.suffix} />
                  </div>

                  <h3 className="text-base font-bold text-white mb-1.5">
                    {item.label}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-white/65 leading-relaxed pt-3 border-t border-white/10 mt-3">
                  {item.subtext}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}
