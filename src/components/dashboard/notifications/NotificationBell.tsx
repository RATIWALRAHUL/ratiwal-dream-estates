"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Archive,
  ExternalLink,
  Loader2,
  Calendar,
  Users,
  Building,
  Mail,
  X,
} from "lucide-react";
import {
  getInAppNotificationsAction,
  markInAppNotificationReadAction,
  markAllInAppNotificationsReadAction,
  archiveInAppNotificationAction,
} from "@/lib/actions/communication.actions";
import { InAppNotificationItem } from "@/types/communication";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<InAppNotificationItem[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);
  const inFlightRef = useRef(false);

  const fetchNotifications = async () => {
    if (inFlightRef.current || !isMountedRef.current) return;
    // Do not execute network poll if browser tab is hidden/inactive
    if (typeof document !== "undefined" && document.hidden) return;

    inFlightRef.current = true;
    try {
      const data = await getInAppNotificationsAction();
      if (isMountedRef.current) {
        setUnreadCount(data.unreadCount);
        setNotifications(data.notifications);
        setHasLoadedOnce(true);
      }
    } catch {
      // safe fallback
    } finally {
      inFlightRef.current = false;
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    let intervalId: NodeJS.Timeout | null = null;

    const startPolling = () => {
      if (!intervalId) {
        intervalId = setInterval(fetchNotifications, 45000);
      }
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (typeof document === "undefined") return;
      if (document.hidden) {
        stopPolling();
      } else {
        // Tab restored to focus: immediately refresh and restart polling
        fetchNotifications();
        startPolling();
      }
    };

    // Initial fetch on mount
    fetchNotifications();
    startPolling();

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    return () => {
      isMountedRef.current = false;
      stopPolling();
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
    };
  }, []);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const handleOpen = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      if (!hasLoadedOnce && notifications.length === 0) {
        setIsLoading(true);
      }
      fetchNotifications();
    }
  };

  const handleMarkRead = (id: string) => {
    // Instant optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    startTransition(async () => {
      await markInAppNotificationReadAction(id);
    });
  };

  const handleMarkAllRead = () => {
    // Instant optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
    );
    setUnreadCount(0);

    startTransition(async () => {
      await markAllInAppNotificationsReadAction();
    });
  };

  const handleArchive = (id: string) => {
    const item = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (item && !item.readAt) {
      setUnreadCount((c) => Math.max(0, c - 1));
    }

    startTransition(async () => {
      await archiveInAppNotificationAction(id);
    });
  };

  const filteredItems =
    filter === "unread" ? notifications.filter((n) => !n.readAt) : notifications;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={handleOpen}
        className="relative p-2 rounded-xl border border-[rgba(7,26,40,0.1)] bg-white text-[#071a28] hover:bg-slate-50 hover:border-[#087fc3]/40 transition-all shadow-2xs"
        aria-label="Open notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4 text-[#071a28]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold font-mono text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Drawer */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#fffdf8] rounded-2xl border border-[rgba(7,26,40,0.12)] shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 bg-[#f8f7f4] border-b border-[rgba(7,26,40,0.06)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold font-serif text-[#071a28] tracking-tight">
                Activity Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#087fc3]/10 text-[#087fc3] text-[9px] font-mono font-bold">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={isPending}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-[#087fc3] hover:underline px-2 py-1 rounded"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-[#647581] hover:text-[#071a28] rounded-lg"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-[rgba(7,26,40,0.06)] bg-white px-3 pt-1">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 text-xs font-bold border-b-2 transition-all ${
                filter === "all"
                  ? "border-[#087fc3] text-[#087fc3]"
                  : "border-transparent text-[#647581] hover:text-[#071a28]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-1.5 text-xs font-bold border-b-2 transition-all ${
                filter === "unread"
                  ? "border-[#087fc3] text-[#087fc3]"
                  : "border-transparent text-[#647581] hover:text-[#071a28]"
              }`}
            >
              Unread {unreadCount > 0 ? `(${unreadCount})` : ""}
            </button>
          </div>

          {/* List Content */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[rgba(7,26,40,0.04)] bg-white">
            {isLoading && notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#647581] flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#087fc3]" />
                <span>Loading activity log…</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#647581]">
                <Bell className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-[#071a28]">No notifications</p>
                <p className="text-[11px] text-[#8c9ba5] mt-0.5">
                  {filter === "unread" ? "All notifications have been read." : "New leads and site visit updates will appear here."}
                </p>
              </div>
            ) : (
              filteredItems.map((n) => {
                const isUnread = !n.readAt;
                return (
                  <div
                    key={n.id}
                    className={`p-3.5 transition-colors flex items-start gap-3 group ${
                      isUnread ? "bg-[#f4f9fc]/60" : "hover:bg-[#f8f7f4]"
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        n.entityType === "SITE_VISIT"
                          ? "bg-[#087fc3]/10 text-[#087fc3]"
                          : n.entityType === "LEAD"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {n.entityType === "SITE_VISIT" ? (
                        <Calendar className="w-3.5 h-3.5" />
                      ) : n.entityType === "LEAD" ? (
                        <Users className="w-3.5 h-3.5" />
                      ) : (
                        <Mail className="w-3.5 h-3.5" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs truncate ${isUnread ? "font-bold text-[#071a28]" : "font-semibold text-[#2b3a42]"}`}>
                          {n.title}
                        </p>
                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#087fc3] shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#647581] line-clamp-2 mt-0.5 leading-relaxed">
                        {n.message}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-[rgba(7,26,40,0.03)] text-[10px] text-[#8c9ba5]">
                        <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        <div className="flex items-center gap-2">
                          {n.deepLink && (
                            <Link
                              href={n.deepLink}
                              onClick={() => {
                                if (isUnread) handleMarkRead(n.id);
                                setIsOpen(false);
                              }}
                              className="font-bold text-[#087fc3] hover:underline inline-flex items-center gap-0.5"
                            >
                              <span>View</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          )}
                          {isUnread && (
                            <button
                              type="button"
                              onClick={() => handleMarkRead(n.id)}
                              className="text-[#647581] hover:text-[#071a28]"
                              title="Mark read"
                            >
                              Read
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleArchive(n.id)}
                            className="text-[#8c9ba5] hover:text-rose-600"
                            title="Archive"
                          >
                            <Archive className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer link to full dashboard communications */}
          <div className="p-2.5 bg-[#f8f7f4] border-t border-[rgba(7,26,40,0.06)] text-center">
            <Link
              href="/dashboard/communications"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-[#087fc3] hover:underline"
            >
              Open Communication Hub →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
