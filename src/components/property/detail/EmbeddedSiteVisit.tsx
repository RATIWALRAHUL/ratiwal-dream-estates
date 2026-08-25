"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Video,
  MapPin,
  Loader2,
  Users,
  Building,
} from "lucide-react";
import { Property } from "@/types/property";

interface EmbeddedSiteVisitProps {
  property: Property;
}

interface AvailableSlot {
  startAt: string;
  endAt: string;
  displayTime: string;
  durationMinutes: number;
  available: boolean;
}

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  visitorCount: number;
  message: string;
  consentGranted: boolean;
  _honeypot?: string;
}

export function EmbeddedSiteVisit({ property }: EmbeddedSiteVisitProps) {
  const [meetingMode, setMeetingMode] = useState<"IN_PERSON" | "VIRTUAL_TOUR">("IN_PERSON");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);

  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedRef, setConfirmedRef] = useState<string | null>(null);

  const formStartedAt = useState(() => new Date().toISOString())[0];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      visitorCount: 1,
      message: "",
      consentGranted: true,
      _honeypot: "",
    },
  });

  // Calculate default date (tomorrow)
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];
    setSelectedDate(dateStr);
  }, []);

  // Fetch slots whenever selectedDate or propertyId or meetingMode changes
  useEffect(() => {
    if (!selectedDate || !property.id) return;

    let isMounted = true;
    setIsLoadingSlots(true);
    setSlotsError(null);
    setSelectedSlot(null);

    const endDate = new Date(selectedDate);
    endDate.setDate(endDate.getDate() + 2); // 3-day query window

    const params = new URLSearchParams({
      propertyId: property.id,
      startDate: selectedDate,
      endDate: endDate.toISOString().split("T")[0],
      meetingMode,
    });

    fetch(`/api/site-visits/availability?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && Array.isArray(data.data?.slots)) {
          // Filter slots matching the selectedDate in IST
          const matching = data.data.slots.filter((s: AvailableSlot) => {
            const slotDate = new Date(s.startAt).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
            return slotDate === selectedDate;
          });
          setAvailableSlots(matching);
          if (matching.length > 0) {
            setSelectedSlot(matching[0]);
          }
        } else {
          setAvailableSlots([]);
        }
      })
      .catch(() => {
        if (isMounted) setSlotsError("Unable to load live availability. You can still submit your preferred time.");
      })
      .finally(() => {
        if (isMounted) setIsLoadingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDate, property.id, meetingMode]);

  const onSubmit = async (values: FormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const preferredStartAt = selectedSlot
        ? selectedSlot.startAt
        : new Date(`${selectedDate}T11:00:00+05:30`).toISOString();

      const preferredEndAt = selectedSlot ? selectedSlot.endAt : undefined;

      const payload = {
        fullName: values.fullName,
        phone: values.phone,
        email: values.email || undefined,
        propertyId: property.id,
        preferredStartAt,
        preferredEndAt,
        meetingMode,
        visitorCount: Number(values.visitorCount) || 1,
        message: values.message ? `[${meetingMode === "IN_PERSON" ? "On-Ground Inspection" : "Virtual Consultation"}] ${values.message}` : undefined,
        consentGranted: true,
        _honeypot: values._honeypot,
        _formStartedAt: formStartedAt,
      };

      const response = await fetch("/api/site-visits/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Booking request failed. Please check inputs.");
      }

      setConfirmedRef(data.referenceNumber || "RDE-SV-CONFIRMED");
      reset();
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "An error occurred while booking. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="book-site-visit" aria-labelledby="site-visit-heading" className="mb-12">
      <div className="p-7 sm:p-10 rounded-3xl bg-gradient-to-br from-[#031C2B] via-[#072435] to-[#082B3B] text-white border border-[rgba(255,255,255,0.12)] shadow-[0_16px_40px_rgba(3,28,43,0.3)] relative overflow-hidden">
        {/* Subtle background grid */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#52BDE9_1px,transparent_1px)] [background-size:24px_24px]"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(82,189,233,0.14)] border border-[rgba(82,189,233,0.3)] text-[#52BDE9] text-xs font-bold uppercase tracking-wider mb-3">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Direct Advisor Booking</span>
            </div>
            <h2
              id="site-visit-heading"
              className="font-heading text-2xl sm:text-3xl lg:text-4xl text-white font-normal leading-tight tracking-tight mb-2"
            >
              Schedule a site visit or virtual consultation.
            </h2>
            <p className="text-xs sm:text-sm text-[#c5d8e4] max-w-lg mx-auto">
              Inspect on-ground boundary demarcation, sector roads, and JDA/RERA revenue dossiers with our land advisors.
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex rounded-2xl bg-[rgba(255,255,255,0.08)] p-1.5 border border-[rgba(255,255,255,0.12)] mb-6 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setMeetingMode("IN_PERSON")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                meetingMode === "IN_PERSON"
                  ? "bg-[#0784C8] text-white shadow-sm"
                  : "text-[#c5d8e4] hover:text-white"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Physical Site Visit</span>
            </button>

            <button
              type="button"
              onClick={() => setMeetingMode("VIRTUAL_TOUR")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                meetingMode === "VIRTUAL_TOUR"
                  ? "bg-[#0784C8] text-white shadow-sm"
                  : "text-[#c5d8e4] hover:text-white"
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Virtual Consultation</span>
            </button>
          </div>

          {/* Success State */}
          {confirmedRef ? (
            <div className="p-8 rounded-2xl bg-[rgba(36,209,127,0.12)] border border-[rgba(36,209,127,0.3)] text-center text-white space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#24D17F] text-[#031C2B] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#24D17F] uppercase">
                  BOOKING REQUEST RECORDED
                </span>
                <h3 className="font-heading text-xl font-bold text-white mt-1">
                  Reference #{confirmedRef}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[#c5d8e4] max-w-md mx-auto">
                Our property advisor will verify on-ground logistics and contact you shortly to confirm your itinerary for {property.name}.
              </p>
              <p className="text-[11px] text-[#7a93a5] italic">
                Preferred times are subject to advisor and property availability.
              </p>
              <button
                type="button"
                onClick={() => setConfirmedRef(null)}
                className="px-5 py-2.5 rounded-full bg-[#031C2B] hover:bg-[#0784C8] text-white text-xs font-semibold uppercase tracking-wider transition-colors border border-[rgba(255,255,255,0.2)]"
              >
                Book Another Tour
              </button>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {submitError && (
                <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-xs text-red-200">
                  {submitError}
                </div>
              )}

              {/* Honeypot */}
              <input type="text" className="hidden" tabIndex={-1} autoComplete="off" {...register("_honeypot")} />

              {/* Step 1: Select Date & Slot */}
              <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#52BDE9] uppercase tracking-wider">
                    1. Choose Preferred Date & Slot
                  </label>
                  <span className="text-[10px] text-[#a0b6c6] font-mono">Asia/Kolkata (IST)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#52BDE9]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    {isLoadingSlots ? (
                      <div className="flex items-center gap-2 py-2 text-xs text-[#a0b6c6]">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Checking advisor schedule…</span>
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="py-2 text-xs text-[#a0b6c6] italic">
                        {slotsError || "No fixed open slots found. An advisor will coordinate your preferred time."}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-1.5">
                        {availableSlots.slice(0, 4).map((slot) => {
                          const isSelected = selectedSlot?.startAt === slot.startAt;
                          return (
                            <button
                              key={slot.startAt}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-medium transition-all text-left truncate ${
                                isSelected
                                  ? "bg-[#52BDE9] text-[#031C2B] font-bold shadow-xs"
                                  : "bg-[rgba(255,255,255,0.08)] text-white hover:bg-[rgba(255,255,255,0.15)]"
                              }`}
                            >
                              {slot.displayTime.replace(" (IST)", "")}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 2: Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#a0b6c6] uppercase tracking-wider mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vikram Sharma"
                    className="w-full px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#52BDE9]"
                    {...register("fullName", { required: "Name is required" })}
                  />
                  {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#a0b6c6] uppercase tracking-wider mb-1.5">
                    Phone (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#52BDE9]"
                    {...register("phone", { required: "Phone is required" })}
                  />
                  {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#a0b6c6] uppercase tracking-wider mb-1.5">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="name@domain.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#52BDE9]"
                    {...register("email")}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#a0b6c6] uppercase tracking-wider mb-1.5">
                    Visitors
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    defaultValue={1}
                    className="w-full px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#52BDE9]"
                    {...register("visitorCount", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#a0b6c6] uppercase tracking-wider mb-1.5">
                  Specific Requirements or Plot Interests (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Interested in East-facing villa plots, requesting revenue search review."
                  className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#52BDE9]"
                  {...register("message")}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-full bg-[#0784C8] hover:bg-[#129be0] text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md focus-visible:outline disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transmitting Request…</span>
                  </>
                ) : (
                  <span>Request {meetingMode === "IN_PERSON" ? "Site Visit" : "Virtual Consultation"}</span>
                )}
              </button>

              <p className="text-[11px] text-[#7a93a5] text-center italic">
                * Preferred times are subject to advisor and property confirmation.
              </p>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#7a93a5] text-center pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#24D17F]" />
                <span>Your contact details are strictly confidential. No marketing spam.</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
