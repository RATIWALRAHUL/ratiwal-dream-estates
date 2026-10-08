"use client";

import { useState, useEffect, useId, useRef, useCallback } from "react";
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
  AlertCircle,
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

interface DarkFloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

function DarkFloatingInput({
  label,
  error,
  required,
  type = "text",
  placeholder,
  value,
  defaultValue,
  onFocus,
  onBlur,
  onChange,
  className,
  ...props
}: DarkFloatingInputProps) {
  const generatedId = useId();
  const id = props.id || generatedId;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [internalVal, setInternalVal] = useState<string | number | readonly string[]>(
    value ?? defaultValue ?? ""
  );

  useEffect(() => {
    if (value !== undefined) {
      setInternalVal(value);
    }
  }, [value]);

  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== "") {
      setInternalVal(inputRef.current.value);
    }
  }, []);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setInternalVal(e.target.value);
    onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalVal(e.target.value);
    onChange?.(e);
  };

  const hasValue = internalVal !== "" && internalVal !== null && internalVal !== undefined;
  const isDateOrTime = type === "date" || type === "time" || type === "datetime-local";
  const isFloating = isFocused || hasValue || isDateOrTime;

  return (
    <div className="w-full flex flex-col space-y-1">
      <div className="relative w-full pt-1.5">
        <input
          ref={inputRef}
          id={id}
          type={type}
          value={value}
          defaultValue={defaultValue}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          placeholder={isFloating ? placeholder : undefined}
          className={`w-full min-h-[48px] rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-medium text-white transition-all duration-200 outline-none shadow-none ${
            error
              ? "border-red-400/90 focus:border-red-400 bg-red-950/20"
              : isFocused
              ? "border-[#52BDE9] bg-[rgba(255,255,255,0.09)] shadow-[0_0_14px_rgba(82,189,233,0.18)]"
              : "border-[rgba(255,255,255,0.14)] hover:border-[rgba(255,255,255,0.28)] bg-[rgba(255,255,255,0.06)]"
          } ${isFloating ? "placeholder:text-[#6a879a]" : "placeholder:opacity-0"} ${className || ""}`}
          style={{ outline: "none" }}
          aria-invalid={error ? "true" : "false"}
          {...props}
        />

        {label && (
          <label
            htmlFor={id}
            className={`absolute transition-all duration-200 ease-out pointer-events-none select-none flex items-center leading-none ${
              isFloating
                ? "top-1.5 -translate-y-1/2 left-4 px-1.5 bg-[#062132] text-[11px] sm:text-xs font-semibold text-white z-10"
                : "top-1/2 -translate-y-1/2 left-4 text-xs sm:text-sm font-normal text-[#8ba3b5]"
            } ${
              error ? "text-red-400" : isFloating ? "text-white" : "text-[#8ba3b5]"
            }`}
          >
            <span>{label}</span>
            {required && isFocused && (
              <span className="text-red-400 ml-1 font-bold text-xs leading-none animate-fadeIn" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400 mt-1 flex items-center gap-1.5 animate-fadeIn" role="alert">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

interface DarkFloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  required?: boolean;
}

function DarkFloatingTextarea({
  label,
  error,
  required,
  placeholder,
  value,
  defaultValue,
  onFocus,
  onBlur,
  onChange,
  className,
  ...props
}: DarkFloatingTextareaProps) {
  const generatedId = useId();
  const id = props.id || generatedId;
  const [isFocused, setIsFocused] = useState(false);
  const [internalVal, setInternalVal] = useState<string | number | readonly string[]>(
    value ?? defaultValue ?? ""
  );

  useEffect(() => {
    if (value !== undefined) {
      setInternalVal(value);
    }
  }, [value]);

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    setInternalVal(e.target.value);
    onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInternalVal(e.target.value);
    onChange?.(e);
  };

  const hasValue = internalVal !== "" && internalVal !== null && internalVal !== undefined;
  const isFloating = isFocused || hasValue;

  return (
    <div className="w-full flex flex-col space-y-1">
      <div className="relative w-full pt-1.5">
        <textarea
          id={id}
          value={value}
          defaultValue={defaultValue}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          placeholder={isFloating ? placeholder : undefined}
          className={`w-full min-h-[76px] rounded-xl border px-4 py-3 text-xs sm:text-sm font-medium text-white transition-all duration-200 outline-none shadow-none resize-none ${
            error
              ? "border-red-400/90 focus:border-red-400 bg-red-950/20"
              : isFocused
              ? "border-[#52BDE9] bg-[rgba(255,255,255,0.09)] shadow-[0_0_14px_rgba(82,189,233,0.18)]"
              : "border-[rgba(255,255,255,0.14)] hover:border-[rgba(255,255,255,0.28)] bg-[rgba(255,255,255,0.06)]"
          } ${isFloating ? "placeholder:text-[#6a879a]" : "placeholder:opacity-0"} ${className || ""}`}
          style={{ outline: "none" }}
          aria-invalid={error ? "true" : "false"}
          {...props}
        />

        {label && (
          <label
            htmlFor={id}
            className={`absolute transition-all duration-200 ease-out pointer-events-none select-none flex items-center leading-none ${
              isFloating
                ? "top-1.5 -translate-y-1/2 left-4 px-1.5 bg-[#062132] text-[11px] sm:text-xs font-semibold text-white z-10"
                : "top-5 -translate-y-1/2 left-4 text-xs sm:text-sm font-normal text-[#8ba3b5]"
            } ${
              error ? "text-red-400" : isFloating ? "text-white" : "text-[#8ba3b5]"
            }`}
          >
            <span>{label}</span>
            {required && isFocused && (
              <span className="text-red-400 ml-1 font-bold text-xs leading-none animate-fadeIn" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400 mt-1 flex items-center gap-1.5 animate-fadeIn" role="alert">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

export function EmbeddedSiteVisit({ property }: EmbeddedSiteVisitProps) {
  const [meetingMode, setMeetingMode] = useState<"IN_PERSON" | "VIRTUAL_TOUR">("IN_PERSON");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);

  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [visitorCount, setVisitorCount] = useState<number>(1);
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedRef, setConfirmedRef] = useState<string | null>(null);

  const formStartedAt = useRef(new Date().toISOString()).current;

  // Clear single field error as user types
  const clearFieldError = useCallback((fieldName: string) => {
    setFieldErrors((prev) => {
      if (!prev[fieldName]) return prev;
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  }, []);

  // Calculate default date (tomorrow)
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];
    setSelectedDate(dateStr);
  }, []);

  // Fetch slots whenever selectedDate or property.id or meetingMode changes
  useEffect(() => {
    const propIdentifier = property.id || property.slug;
    if (!selectedDate || !propIdentifier) return;

    let isMounted = true;
    setIsLoadingSlots(true);
    setSlotsError(null);
    setSelectedSlot(null);

    const endDate = new Date(selectedDate);
    endDate.setDate(endDate.getDate() + 2); // 3-day query window

    const params = new URLSearchParams({
      propertyId: propIdentifier,
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
  }, [selectedDate, property.id, property.slug, meetingMode]);

  // Client validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) {
      errors.fullName = "Please enter your full name.";
    } else if (fullName.trim().length < 2) {
      errors.fullName = "Full name must be at least 2 characters.";
    }

    const cleanPhone = phone.replace(/[^\d+]/g, "");
    const digitCount = cleanPhone.replace(/\D/g, "").length;
    if (!phone.trim()) {
      errors.phone = "Phone number is required for visit confirmation.";
    } else if (digitCount < 10) {
      errors.phone = "Please enter a valid 10-digit mobile number.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = "Email address is required for sending the booking dossier.";
    } else if (!emailRegex.test(email.trim())) {
      errors.email = "Please enter a valid email address (e.g. name@domain.com).";
    }

    if (!selectedDate) {
      errors.selectedDate = "Please choose a preferred visit date.";
    }

    if (!visitorCount || visitorCount < 1) {
      errors.visitorCount = "Visitor count must be at least 1.";
    } else if (visitorCount > 20) {
      errors.visitorCount = "For groups over 20, please connect directly with our advisory desk.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const isValid = validateForm();
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const preferredStartAt = selectedSlot
        ? selectedSlot.startAt
        : selectedDate
        ? new Date(`${selectedDate}T11:00:00+05:30`).toISOString()
        : "";

      const preferredEndAt = selectedSlot ? selectedSlot.endAt : undefined;

      const payload = {
        fullName: fullName.trim(),
        name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        propertyId: property.id || property.slug,
        preferredStartAt,
        preferredEndAt,
        meetingMode,
        visitorCount: Number(visitorCount) || 1,
        message: message.trim()
          ? `[${meetingMode === "IN_PERSON" ? "On-Ground Inspection" : "Virtual Consultation"}] ${message.trim()}`
          : undefined,
        consentGranted: true,
        source: "PUBLIC_PROPERTY_PAGE",
        _honeypot: honeypot,
        _formStartedAt: formStartedAt,
      };

      const response = await fetch("/api/site-visits/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.fields && typeof data.fields === "object") {
          const mappedErrors: Record<string, string> = {};
          for (const [key, val] of Object.entries(data.fields)) {
            if (Array.isArray(val) && val.length > 0) {
              const fieldKey = key === "name" ? "fullName" : key === "preferredStartAt" ? "selectedDate" : key;
              mappedErrors[fieldKey] = val[0];
            }
          }
          setFieldErrors((prev) => ({ ...prev, ...mappedErrors }));
        }
        throw new Error(data.error || "Booking request failed. Please check the highlighted inputs.");
      }

      setConfirmedRef(data.referenceNumber || "RDE-SV-CONFIRMED");
      setFullName("");
      setPhone("");
      setEmail("");
      setMessage("");
      setFieldErrors({});
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "An error occurred while transmitting your booking. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="book-visit" aria-labelledby="site-visit-heading" className="mb-8 sm:mb-12">
      <div className="p-5 sm:p-8 sm:p-10 rounded-2xl sm:rounded-3xl bg-[#062132] text-white border border-[rgba(255,255,255,0.12)] shadow-[0_16px_40px_rgba(3,28,43,0.3)] relative overflow-hidden">
        {/* Background micro-grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#52BDE9_1px,transparent_1px)] [background-size:24px_24px]"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-[rgba(82,189,233,0.14)] border border-[rgba(82,189,233,0.3)] text-[#52BDE9] text-[10.5px] sm:text-xs font-semibold uppercase tracking-wider mb-2.5 sm:mb-3">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Direct Advisor Booking</span>
            </div>
            <h2
              id="site-visit-heading"
              className="font-instrument text-2xl sm:text-3xl lg:text-4xl text-white font-normal leading-tight tracking-tight mb-2"
            >
              Schedule a site visit or virtual consultation.
            </h2>
            <p className="text-xs sm:text-sm text-[#c5d8e4] max-w-lg mx-auto">
              Inspect on-ground boundary demarcation, sector roads, and JDA/RERA revenue dossiers with our land advisors.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-xl sm:rounded-2xl bg-[rgba(255,255,255,0.08)] p-1 sm:p-1.5 border border-[rgba(255,255,255,0.12)] mb-6 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setMeetingMode("IN_PERSON")}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
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
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                meetingMode === "VIRTUAL_TOUR"
                  ? "bg-[#0784C8] text-white shadow-sm"
                  : "text-[#c5d8e4] hover:text-white"
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Virtual Consultation</span>
            </button>
          </div>

          {/* Success State Screen */}
          {confirmedRef ? (
            <div className="p-8 sm:p-10 rounded-2xl bg-[rgba(36,209,127,0.1)] border border-[rgba(36,209,127,0.3)] text-center text-white space-y-4 animate-fadeIn">
              <div className="w-14 h-14 rounded-full bg-[#24D17F] text-[#031C2B] flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold tracking-widest text-[#24D17F] uppercase">
                  BOOKING REQUEST RECORDED
                </span>
                <h3 className="font-heading text-xl sm:text-2xl font-bold text-white mt-1">
                  Reference #{confirmedRef}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[#c5d8e4] max-w-md mx-auto leading-relaxed">
                Our property advisor will verify on-ground logistics and contact you shortly to confirm your itinerary for{" "}
                <span className="text-white font-semibold">{property.name}</span>.
              </p>
              <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] max-w-sm mx-auto text-xs text-[#a3c0d4] flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-[#52BDE9]" />
                <span>Preferred: {selectedDate} &bull; {selectedSlot ? selectedSlot.displayTime : "11:00 AM IST"}</span>
              </div>
              <button
                type="button"
                onClick={() => setConfirmedRef(null)}
                className="mt-2 px-6 py-2.5 rounded-full bg-[#0784C8] hover:bg-[#129be0] text-white text-xs font-semibold uppercase tracking-wider transition-all duration-300 shadow-md"
              >
                Schedule Another Tour
              </button>
            </div>
          ) : (
            /* Booking Form with noValidate & floating interactions */
            <form noValidate onSubmit={handleSubmit} className="space-y-4">
              {/* Anti-spam Honeypot */}
              <input
                type="text"
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />

              {/* Step 1: Select Date & Time Slot */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#52BDE9] uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>1. Choose Preferred Date &amp; Slot</span>
                  </label>
                  <span className="text-[10px] text-[#a0b6c6] font-mono">Asia/Kolkata (IST)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <DarkFloatingInput
                      label="Select Date"
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        clearFieldError("selectedDate");
                      }}
                      error={fieldErrors.selectedDate}
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    {isLoadingSlots ? (
                      <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-xs text-[#a0b6c6]">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#52BDE9]" />
                        <span>Checking advisor schedule…</span>
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="py-3 px-3.5 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-xs text-[#a0b6c6] italic">
                        {slotsError || "Live slots are open for flexible timing. Our advisor will confirm your custom slot."}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {availableSlots.slice(0, 4).map((slot) => {
                          const isSelected = selectedSlot?.startAt === slot.startAt;
                          return (
                            <button
                              key={slot.startAt}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={`px-3 py-2 rounded-xl text-[11px] font-mono font-medium transition-all text-left truncate border ${
                                isSelected
                                  ? "bg-[#52BDE9] text-[#031C2B] font-bold border-[#52BDE9] shadow-sm"
                                  : "bg-[rgba(255,255,255,0.06)] text-white border-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.25)] hover:bg-[rgba(255,255,255,0.12)]"
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

              {/* Step 2: Name & Phone with Contact-Us Style Interactive Floating Labels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <DarkFloatingInput
                  label="Your Name"
                  placeholder="e.g. Vikram Sharma"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    clearFieldError("fullName");
                  }}
                  error={fieldErrors.fullName}
                  required
                />

                <DarkFloatingInput
                  label="Phone (WhatsApp)"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    clearFieldError("phone");
                  }}
                  error={fieldErrors.phone}
                  required
                />
              </div>

              {/* Step 3: Email & Visitors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                <div className="sm:col-span-2">
                  <DarkFloatingInput
                    label="Email Address"
                    type="email"
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearFieldError("email");
                    }}
                    error={fieldErrors.email}
                    required
                  />
                </div>

                <div>
                  <DarkFloatingInput
                    label="Visitors"
                    type="number"
                    min={1}
                    max={20}
                    value={visitorCount}
                    onChange={(e) => {
                      setVisitorCount(Number(e.target.value) || 1);
                      clearFieldError("visitorCount");
                    }}
                    error={fieldErrors.visitorCount}
                  />
                </div>
              </div>

              {/* Step 4: Specific Requirements */}
              <div>
                <DarkFloatingTextarea
                  label="Specific Requirements or Plot Interests (Optional)"
                  placeholder="e.g. Interested in East-facing villa plots, requesting revenue search review."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              {/* Global Error Notice if returned from server */}
              {submitError && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Transmit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-full bg-[#0784C8] hover:bg-[#129be0] text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md focus-visible:outline-none disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transmitting Request to Advisor Desk…</span>
                  </>
                ) : (
                  <span>Request {meetingMode === "IN_PERSON" ? "Site Visit" : "Virtual Consultation"}</span>
                )}
              </button>

              <p className="text-[11px] text-[#7a93a5] text-center italic">
                * Preferred times are subject to advisor and property confirmation.
              </p>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#7a93a5] text-center pt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#24D17F]" />
                <span>Your contact details are strictly confidential. Encrypted CRM intake.</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
export default EmbeddedSiteVisit;
