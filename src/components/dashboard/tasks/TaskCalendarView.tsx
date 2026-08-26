"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowLeft } from "lucide-react";

interface CalendarTask {
  id: string;
  taskNumber: string;
  title: string;
  taskType: string;
  status: string;
  priority: string;
  dueAt: string;
  assignedUserName: string;
  assignedTeam?: string;
}

interface TaskCalendarViewProps {
  initialTasks: CalendarTask[];
  currentUserId: string;
}

export function TaskCalendarView({ initialTasks }: TaskCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  const tasksByDay: Record<number, CalendarTask[]> = {};
  for (const task of initialTasks) {
    const taskDate = new Date(task.dueAt);
    if (taskDate.getFullYear() === year && taskDate.getMonth() === month) {
      const day = taskDate.getDate();
      tasksByDay[day] = tasksByDay[day] || [];
      tasksByDay[day].push(task);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/my-work"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#647581] hover:text-[#071a28] mb-1 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Work Queue</span>
          </Link>
          <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#071a28]">
            Operational Calendar (IST)
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white hover:bg-stone-50 transition shadow-2xs cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-[#071a28]" />
          </button>
          <span className="font-serif font-bold text-sm text-[#071a28] min-w-36 text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white hover:bg-stone-50 transition shadow-2xs cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 text-[#071a28]" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-3xl border border-[rgba(7,26,40,0.08)] bg-white overflow-hidden shadow-2xs">
        <div className="grid grid-cols-7 border-b border-[rgba(7,26,40,0.08)] bg-[#f8f7f4] text-center py-3 text-xs font-bold text-[#647581]">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[rgba(7,26,40,0.06)] min-h-[520px]">
          {/* Empty prefix days */}
          {[...Array(firstDayIndex)].map((_, i) => (
            <div key={`empty-${i}`} className="p-2 bg-[#f8f7f4]/40 min-h-24" />
          ))}

          {/* Month Days */}
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const dayTasks = tasksByDay[day] || [];
            const isToday =
              new Date().getFullYear() === year &&
              new Date().getMonth() === month &&
              new Date().getDate() === day;

            return (
              <div
                key={`day-${day}`}
                className={`p-2.5 min-h-24 transition ${
                  isToday
                    ? "bg-sky-50/50"
                    : "hover:bg-[#f8f7f4]/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full ${
                      isToday
                        ? "bg-[#0088cc] text-white shadow-2xs"
                        : "text-[#071a28]"
                    }`}
                  >
                    {day}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-bold text-[#647581]">
                      {dayTasks.length} task{dayTasks.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <div className="mt-1.5 space-y-1 overflow-y-auto max-h-20">
                  {dayTasks.slice(0, 3).map((t) => (
                    <Link
                      key={t.id}
                      href={`/dashboard/tasks/${t.id}`}
                      className="block text-[11px] p-1.5 rounded-lg bg-[#f8f7f4] hover:bg-sky-100/70 text-[#071a28] truncate font-medium transition border border-[rgba(7,26,40,0.04)]"
                    >
                      <span className="font-bold text-[#0088cc] mr-1">{t.taskNumber}</span>
                      <span>{t.title}</span>
                    </Link>
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[10px] text-[#647581] font-semibold block px-1">
                      +{dayTasks.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
