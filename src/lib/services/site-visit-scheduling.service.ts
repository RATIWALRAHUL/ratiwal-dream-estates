import "server-only";
import { connectToDatabase } from "@/lib/db/mongoose";
import { AdvisorAvailability, IAdvisorAvailability } from "@/models/AdvisorAvailability";
import { AdvisorSlotLock } from "@/models/AdvisorSlotLock";
import { SiteVisit } from "@/models/SiteVisit";
import { Property } from "@/models/Property";
import { logger } from "@/lib/logger";
import { Types } from "mongoose";

export interface GeneratedPublicSlot {
  startAt: string; // ISO 8601 UTC
  endAt: string; // ISO 8601 UTC
  displayTime: string; // e.g. "10:00 AM - 11:00 AM (IST)"
  durationMinutes: number;
  available: boolean;
}

export interface SlotAvailabilityQuery {
  propertyId: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  meetingMode?: string;
  advisorId?: string;
}

const DEFAULT_TIMEZONE = "Asia/Kolkata";
const LOCK_INTERVAL_MINUTES = 15;

/**
 * Parses a date string and local time string (in Asia/Kolkata) into a UTC Date object.
 * e.g., "2026-08-26", "10:30" -> UTC Date representation of 2026-08-26 10:30:00 IST (+05:30)
 */
export function parseLocalTimeToUtc(dateStr: string, timeStr: string, _tz = DEFAULT_TIMEZONE): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);

  // In Asia/Kolkata, offset is fixed at UTC+05:30 (no daylight saving time)
  // UTC time = Local time - 5 hours 30 minutes
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  utcDate.setUTCMinutes(utcDate.getUTCMinutes() - 330); // subtract 330 mins (+5:30)
  return utcDate;
}

/**
 * Formats a UTC date into local time string in Asia/Kolkata.
 */
export function formatUtcToDisplayIST(startUtc: Date, endUtc: Date): string {
  const timeFormatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: DEFAULT_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${timeFormatter.format(startUtc)} – ${timeFormatter.format(endUtc)} (IST)`;
}

/**
 * Breaks a time range (including before and after buffers) into standard 15-minute slot keys.
 * e.g. slotKey: "2026-08-26T04:30:00.000Z"
 */
export function generateSlotKeysForInterval(
  startAt: Date,
  endAt: Date,
  bufferBeforeMinutes = 15,
  bufferAfterMinutes = 15
): { slotKey: string; slotStart: Date; slotEnd: Date }[] {
  const intervalMs = LOCK_INTERVAL_MINUTES * 60 * 1000;
  const lockedStartMs = startAt.getTime() - bufferBeforeMinutes * 60 * 1000;
  const lockedEndMs = endAt.getTime() + bufferAfterMinutes * 60 * 1000;

  // Align to lower 15-min boundary
  const firstSlotMs = Math.floor(lockedStartMs / intervalMs) * intervalMs;
  const slots: { slotKey: string; slotStart: Date; slotEnd: Date }[] = [];

  for (let currentMs = firstSlotMs; currentMs < lockedEndMs; currentMs += intervalMs) {
    const slotStart = new Date(currentMs);
    const slotEnd = new Date(currentMs + intervalMs);
    slots.push({
      slotKey: slotStart.toISOString(),
      slotStart,
      slotEnd,
    });
  }

  return slots;
}

/**
 * Generates safe, anonymous available slots for public booking within a given date range.
 * Evaluates active advisor schedules, applies blackout dates & exceptions,
 * and subtracts busy intervals (active SiteVisits and AdvisorSlotLocks).
 */
export async function generateAvailableSlots(query: SlotAvailabilityQuery): Promise<GeneratedPublicSlot[]> {
  await connectToDatabase();

  const property = await Property.findOne(
    { _id: query.propertyId, publicationStatus: "PUBLISHED", archivedAt: null },
    { _id: 1, title: 1 }
  ).lean();

  if (!property) return [];

  const now = new Date();
  const startDay = new Date(query.startDate);
  const endDay = new Date(query.endDate);

  if (isNaN(startDay.getTime()) || isNaN(endDay.getTime()) || startDay > endDay) {
    return [];
  }

  // Cap maximum query window to 30 days
  const maxEnd = new Date(startDay);
  maxEnd.setDate(maxEnd.getDate() + 30);
  const effectiveEndDay = endDay > maxEnd ? maxEnd : endDay;

  // Retrieve active advisor availabilities (or create a global default schedule if none exists)
  let availabilities = await AdvisorAvailability.find({ active: true }).lean();
  if (availabilities.length === 0) {
    const defaultAvail = await AdvisorAvailability.create({
      advisorId: "GLOBAL_DEFAULT",
      advisorName: "Property Advisory Desk",
      advisorEmail: "advisory@ratiwal.com",
      timezone: DEFAULT_TIMEZONE,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    availabilities = [defaultAvail.toObject() as any];
  }

  // Fetch active visits and active locks within the query range (with 2 hour buffer margins)
  const windowStartUtc = parseLocalTimeToUtc(query.startDate, "00:00");
  const windowEndUtc = parseLocalTimeToUtc(effectiveEndDay.toISOString().split("T")[0], "23:59");

  const [activeVisits, activeLocks] = await Promise.all([
    SiteVisit.find({
      status: { $in: ["CONFIRMED", "PENDING_CONFIRMATION"] },
      $or: [
        { scheduledStartAt: { $gte: windowStartUtc, $lte: windowEndUtc } },
        { requestedStartAt: { $gte: windowStartUtc, $lte: windowEndUtc } },
      ],
    }).lean(),
    AdvisorSlotLock.find({
      status: "ACTIVE",
      slotStartAt: { $gte: windowStartUtc, $lte: windowEndUtc },
    }).lean(),
  ]);

  const activeLockKeys = new Set(activeLocks.map((l) => `${l.advisorId}:${l.slotKey}`));

  const generatedSlots: GeneratedPublicSlot[] = [];
  const processedSlotSignatures = new Set<string>();

  // Iterate over each date in the query range
  const currentIterDate = new Date(startDay);
  while (currentIterDate <= effectiveEndDay) {
    const dateStr = currentIterDate.toISOString().split("T")[0];
    const dayOfWeek = currentIterDate.getUTCDay();

    for (const avail of availabilities) {
      // Check for date-specific exceptions
      const dayException = avail.exceptions?.find((e) => e.date === dateStr);
      if (dayException && dayException.type === "FULL_DAY_UNAVAILABLE") {
        continue;
      }

      // Check weekly working day schedule
      const daySchedule = avail.weeklySchedule?.find((s) => s.dayOfWeek === dayOfWeek);
      if (!daySchedule || !daySchedule.active) {
        continue;
      }

      const startLocal = dayException?.startLocalTime || daySchedule.startLocalTime;
      const endLocal = dayException?.endLocalTime || daySchedule.endLocalTime;

      const durationMinutes = avail.defaultVisitDurationMinutes || 60;
      const slotIntervalMinutes = avail.slotIntervalMinutes || 30;
      const minNoticeHours = avail.minBookingNoticeHours || 4;
      const bufferBefore = avail.bufferBeforeMinutes || 15;
      const bufferAfter = avail.bufferAfterMinutes || 15;

      const windowOpenUtc = parseLocalTimeToUtc(dateStr, startLocal);
      const windowCloseUtc = parseLocalTimeToUtc(dateStr, endLocal);

      let slotStart = new Date(windowOpenUtc);

      while (slotStart.getTime() + durationMinutes * 60 * 1000 <= windowCloseUtc.getTime()) {
        const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);
        const signature = `${slotStart.toISOString()}_${durationMinutes}`;

        if (!processedSlotSignatures.has(signature)) {
          // Verify minimum booking notice (must be at least minNoticeHours into future)
          const noticeThreshold = new Date(now.getTime() + minNoticeHours * 60 * 60 * 1000);
          const isNoticeValid = slotStart >= noticeThreshold;

          if (isNoticeValid) {
            // Check collisions with active slot locks
            const requiredSlotKeys = generateSlotKeysForInterval(slotStart, slotEnd, bufferBefore, bufferAfter);
            const isLockBlocked = requiredSlotKeys.some((k) => activeLockKeys.has(`${avail.advisorId}:${k.slotKey}`));

            // Check collisions with active visits
            const isVisitBlocked = activeVisits.some((v) => {
              const vStart = (v.scheduledStartAt || v.requestedStartAt).getTime() - bufferBefore * 60 * 1000;
              const vEnd = (v.scheduledEndAt || v.requestedEndAt).getTime() + bufferAfter * 60 * 1000;
              const sStart = slotStart.getTime();
              const sEnd = slotEnd.getTime();
              return sStart < vEnd && sEnd > vStart;
            });

            const isAvailable = !isLockBlocked && !isVisitBlocked;

            if (isAvailable) {
              generatedSlots.push({
                startAt: slotStart.toISOString(),
                endAt: slotEnd.toISOString(),
                displayTime: formatUtcToDisplayIST(slotStart, slotEnd),
                durationMinutes,
                available: true,
              });
              processedSlotSignatures.add(signature);
            }
          }
        }

        // Advance by slotIntervalMinutes
        slotStart = new Date(slotStart.getTime() + slotIntervalMinutes * 60 * 1000);
      }
    }

    currentIterDate.setUTCDate(currentIterDate.getUTCDate() + 1);
  }

  // Sort slots chronologically
  return generatedSlots.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
}

/**
 * Atomically acquires 15-minute slot locks for an advisor and confirmed visit schedule.
 * Returns true if all required locks were successfully acquired, false if a conflict occurred.
 */
export async function acquireSlotLocks(
  advisorId: string,
  siteVisitId: Types.ObjectId,
  scheduledStartAt: Date,
  scheduledEndAt: Date,
  bufferBeforeMinutes = 15,
  bufferAfterMinutes = 15
): Promise<{ success: boolean; conflictSlot?: string }> {
  await connectToDatabase();

  const requiredSlots = generateSlotKeysForInterval(
    scheduledStartAt,
    scheduledEndAt,
    bufferBeforeMinutes,
    bufferAfterMinutes
  );

  // Check for any existing active locks
  const existingLocks = await AdvisorSlotLock.find({
    advisorId,
    status: "ACTIVE",
    siteVisitId: { $ne: siteVisitId },
    slotKey: { $in: requiredSlots.map((s) => s.slotKey) },
  }).lean();

  if (existingLocks.length > 0) {
    return { success: false, conflictSlot: existingLocks[0].slotKey };
  }

  // Release any previous locks for this specific site visit (e.g. on reschedule)
  await AdvisorSlotLock.updateMany({ siteVisitId }, { $set: { status: "RELEASED" } });

  // Insert active locks
  const lockDocs = requiredSlots.map((s) => ({
    advisorId,
    siteVisitId,
    slotStartAt: s.slotStart,
    slotEndAt: s.slotEnd,
    slotKey: s.slotKey,
    status: "ACTIVE",
    createdAt: new Date(),
  }));

  try {
    await AdvisorSlotLock.insertMany(lockDocs, { ordered: false });
    return { success: true };
  } catch (error) {
    logger.warn("[SlotLock] Concurrency conflict when inserting locks", {
      advisorId,
      siteVisitId: siteVisitId.toString(),
      error: error instanceof Error ? error.message : "Unknown",
    });
    return { success: false, conflictSlot: "CONCURRENT_CONFLICT" };
  }
}

/**
 * Releases all active slot locks associated with a SiteVisit.
 */
export async function releaseSlotLocks(siteVisitId: Types.ObjectId | string): Promise<void> {
  await connectToDatabase();
  await AdvisorSlotLock.updateMany(
    { siteVisitId: new Types.ObjectId(siteVisitId), status: "ACTIVE" },
    { $set: { status: "RELEASED" } }
  );
}

/**
 * Diagnostic tool to identify orphaned slot locks that do not correspond
 * to active CONFIRMED or PENDING_CONFIRMATION SiteVisits.
 */
export async function auditOrphanLocks(dryRun = true): Promise<{
  totalActiveLocks: number;
  orphanCount: number;
  orphans: { lockId: string; advisorId: string; slotKey: string; siteVisitId: string }[];
}> {
  await connectToDatabase();

  const activeLocks = await AdvisorSlotLock.find({ status: "ACTIVE" }).lean();
  const siteVisitIds = [...new Set(activeLocks.map((l) => l.siteVisitId))];

  const validVisits = await SiteVisit.find(
    {
      _id: { $in: siteVisitIds },
      status: { $in: ["CONFIRMED", "PENDING_CONFIRMATION"] },
    },
    { _id: 1 }
  ).lean();

  const validVisitIdSet = new Set(validVisits.map((v) => v._id.toString()));

  const orphans = activeLocks
    .filter((l) => !validVisitIdSet.has(l.siteVisitId.toString()))
    .map((l) => ({
      lockId: l._id.toString(),
      advisorId: l.advisorId,
      slotKey: l.slotKey,
      siteVisitId: l.siteVisitId.toString(),
    }));

  if (!dryRun && orphans.length > 0) {
    await AdvisorSlotLock.updateMany(
      { _id: { $in: orphans.map((o) => new Types.ObjectId(o.lockId)) } },
      { $set: { status: "RELEASED" } }
    );
  }

  return {
    totalActiveLocks: activeLocks.length,
    orphanCount: orphans.length,
    orphans,
  };
}
