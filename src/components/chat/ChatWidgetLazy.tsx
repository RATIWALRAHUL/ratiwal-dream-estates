"use client";

import dynamic from "next/dynamic";

// The chat panel is interactive-only and never part of the first paint, so keep
// it (and its markdown/message code) out of the initial route bundle.
const ChatWidget = dynamic(
  () => import("./ChatWidget").then((mod) => mod.ChatWidget),
  { ssr: false },
);

export function ChatWidgetLazy() {
  return <ChatWidget />;
}
