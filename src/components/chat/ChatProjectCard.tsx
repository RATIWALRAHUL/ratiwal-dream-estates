"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, ShieldCheck, Ruler, Calendar } from "lucide-react";

export interface ProjectCardData {
  id: string;
  title: string;
  slug: string;
  locality: string;
  city: string;
  propertyType: string;
  sizeRange: string;
  priceLabel: string;
  primaryImageUrl: string | null;
  reraNumber: string | null;
  url: string;
}

interface ChatProjectCardProps {
  project: ProjectCardData;
  onSelectAction?: (text: string) => void;
}

export function ChatProjectCard({ project, onSelectAction }: ChatProjectCardProps) {
  return (
    <div className="w-[230px] shrink-0 snap-start rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden flex flex-col text-left transition-all hover:shadow-md hover:border-[#087fc3]/40">
      {/* Project Image */}
      <div className="relative h-28 w-full bg-slate-100 overflow-hidden">
        {project.primaryImageUrl ? (
          <Image
            src={project.primaryImageUrl}
            alt={project.title}
            fill
            sizes="230px"
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 p-4 text-center">
            <span className="text-xs font-semibold">Ratiwal Dream Estates</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Demarcated Township</span>
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-[#071a28]/85 backdrop-blur-md text-white text-[11px] font-bold shadow-xs">
          {project.priceLabel}
        </div>

        {/* RERA Badge if registered */}
        {project.reraNumber && (
          <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-emerald-500/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
            <ShieldCheck size={11} />
            <span>RERA Verified</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
        <div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#087fc3]">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{project.locality}, {project.city}</span>
          </div>

          <h4 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">
            {project.title}
          </h4>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-2">
            <Ruler size={13} className="text-slate-400 shrink-0" />
            <span>{project.sizeRange}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
          <Link
            href={`/properties/${project.slug}`}
            className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold inline-flex items-center justify-center gap-1 transition-colors"
          >
            <span>View Details</span>
            <ArrowRight size={11} />
          </Link>

          {onSelectAction && (
            <button
              type="button"
              onClick={() => onSelectAction(`I would like to schedule a site visit for ${project.title}`)}
              className="py-1.5 px-2.5 rounded-lg bg-[#087fc3] hover:bg-[#0a6ba3] text-white text-[11px] font-bold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <Calendar size={11} />
              <span>Visit</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
