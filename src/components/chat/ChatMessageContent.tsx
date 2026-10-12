"use client";

import React from "react";

interface ChatMessageContentProps {
  content: string;
}

/**
 * Clean, lightweight markdown renderer for chat messages.
 * Handles headings, bold text, bullet lists, inline code, horizontal rules,
 * and tables without raw asterisks or unparsed symbols.
 */
export function ChatMessageContent({ content }: ChatMessageContentProps) {
  if (!content) return null;

  // Split into lines to process block elements
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let currentList: string[] = [];
  let isNumberedList = false;

  const flushList = (key: string) => {
    if (currentList.length === 0) return;
    if (isNumberedList) {
      blocks.push(
        <ol key={key} className="space-y-1 my-1.5 pl-4 list-decimal text-left">
          {currentList.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {formatInline(item)}
            </li>
          ))}
        </ol>
      );
    } else {
      blocks.push(
        <ul key={key} className="space-y-1 my-1.5 pl-4 list-disc text-left marker:text-sky-600">
          {currentList.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {formatInline(item)}
            </li>
          ))}
        </ul>
      );
    }
    currentList = [];
    isNumberedList = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Empty line
    if (!line) {
      flushList(`list-before-empty-${i}`);
      continue;
    }

    // Horizontal rule
    if (line === "---" || line === "***" || line === "___") {
      flushList(`list-before-hr-${i}`);
      blocks.push(<hr key={`hr-${i}`} className="my-2 border-slate-200" />);
      continue;
    }

    // Headings (###, ##, #)
    if (line.startsWith("### ")) {
      flushList(`list-before-h3-${i}`);
      blocks.push(
        <h4 key={`h3-${i}`} className="font-bold text-xs text-slate-900 mt-2 mb-1 first:mt-0 text-left">
          {formatInline(line.replace(/^###\s+/, ""))}
        </h4>
      );
      continue;
    }
    if (line.startsWith("## ")) {
      flushList(`list-before-h2-${i}`);
      blocks.push(
        <h3 key={`h2-${i}`} className="font-bold text-[13px] text-slate-900 mt-2.5 mb-1 first:mt-0 text-left">
          {formatInline(line.replace(/^##\s+/, ""))}
        </h3>
      );
      continue;
    }
    if (line.startsWith("# ")) {
      flushList(`list-before-h1-${i}`);
      blocks.push(
        <h2 key={`h1-${i}`} className="font-bold text-sm text-slate-900 mt-2.5 mb-1 first:mt-0 text-left">
          {formatInline(line.replace(/^#\s+/, ""))}
        </h2>
      );
      continue;
    }

    // Bullet lists (*, -, •)
    const bulletMatch = line.match(/^[\*\-•]\s+(.+)/);
    if (bulletMatch) {
      if (isNumberedList) flushList(`list-switch-${i}`);
      isNumberedList = false;
      currentList.push(bulletMatch[1]);
      continue;
    }

    // Numbered lists (1., 2., etc.)
    const numberedMatch = line.match(/^\d+[\.\)]\s+(.+)/);
    if (numberedMatch) {
      if (!isNumberedList && currentList.length > 0) flushList(`list-switch-${i}`);
      isNumberedList = true;
      currentList.push(numberedMatch[1]);
      continue;
    }

    // Regular paragraph line
    flushList(`list-before-p-${i}`);

    // If it's a table row separator |:---|:---| skip or render cleaner
    if (line.startsWith("|") && line.includes("---")) {
      continue;
    }

    // Table rows
    if (line.startsWith("|") && line.endsWith("|")) {
      const cells = line
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      blocks.push(
        <div key={`table-row-${i}`} className="grid grid-cols-2 gap-2 py-1 border-b border-slate-100 text-[11px]">
          {cells.map((cell, cIdx) => (
            <div key={cIdx} className={cIdx === 0 ? "font-semibold text-slate-700" : "text-slate-900"}>
              {formatInline(cell)}
            </div>
          ))}
        </div>
      );
      continue;
    }

    blocks.push(
      <p key={`p-${i}`} className="leading-relaxed my-1 first:mt-0 last:mb-0 text-left">
        {formatInline(line)}
      </p>
    );
  }

  flushList("list-final");

  return <div className="space-y-1 text-left text-xs">{blocks}</div>;
}

/**
 * Format inline elements like **bold**, *italic*, `code`, and [links](url).
 */
function formatInline(text: string): React.ReactNode {
  if (!text) return null;

  // Split text by formatting markers
  // Supports **bold**, *italic*, `code`
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Code: `text`
    const codeMatch = remaining.match(/`(.+?)`/);

    // Find earliest match
    const boldIdx = boldMatch ? remaining.indexOf(boldMatch[0]) : -1;
    const codeIdx = codeMatch ? remaining.indexOf(codeMatch[0]) : -1;

    let nextMatch: { type: "bold" | "code"; index: number; full: string; inner: string } | null = null;

    if (boldIdx !== -1 && (codeIdx === -1 || boldIdx <= codeIdx)) {
      nextMatch = { type: "bold", index: boldIdx, full: boldMatch![0], inner: boldMatch![1] };
    } else if (codeIdx !== -1) {
      nextMatch = { type: "code", index: codeIdx, full: codeMatch![0], inner: codeMatch![1] };
    }

    if (!nextMatch) {
      parts.push(remaining);
      break;
    }

    // Add plain text before match
    if (nextMatch.index > 0) {
      parts.push(remaining.slice(0, nextMatch.index));
    }

    // Add formatted element
    if (nextMatch.type === "bold") {
      parts.push(
        <strong key={`bold-${keyIdx++}`} className="font-bold text-slate-900">
          {nextMatch.inner}
        </strong>
      );
    } else if (nextMatch.type === "code") {
      parts.push(
        <code key={`code-${keyIdx++}`} className="px-1 py-0.2 rounded bg-slate-100 text-[11px] font-mono text-slate-800">
          {nextMatch.inner}
        </code>
      );
    }

    remaining = remaining.slice(nextMatch.index + nextMatch.full.length);
  }

  return <>{parts}</>;
}
