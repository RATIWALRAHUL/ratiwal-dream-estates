"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { AlertCircle, CheckCircle2, MapPin } from "lucide-react";

interface SiteVisitFormProps {
  propertyId: string;
  propertyName: string;
  onSuccess?: () => void;
}

interface FormValues {
  name: string;
  phone: string;
  email: string;
  preferredDate: string;
  preferredTime: string;
  numberOfVisitors: number;
  message?: string;
  honeypot?: string;
}

export function SiteVisitForm({
  propertyId,
  propertyName,
  onSuccess,
}: SiteVisitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
  const [confirmedRef, setConfirmedRef] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      numberOfVisitors: 1,
      preferredDate: "",
      preferredTime: "11:00 AM",
      message: "",
      honeypot: "",
    },
  });

  const clearFieldError = (fieldName: string) => {
    if (serverErrors[fieldName]) {
      setServerErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setServerErrors({});

    try {
      const preferredStartAt = values.preferredDate
        ? new Date(`${values.preferredDate}T11:00:00+05:30`).toISOString()
        : "";

      const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
      const inferredSource = propertyId && propertyId !== "general-consultation"
        ? "PUBLIC_PROPERTY_PAGE"
        : currentPath.includes("contact")
        ? "CONTACT_PAGE"
        : "PUBLIC_PROPERTY_PAGE";

      const response = await fetch("/api/site-visits/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: values.name,
          name: values.name,
          phone: values.phone,
          email: values.email || undefined,
          propertyId,
          preferredStartAt,
          visitorCount: Number(values.numberOfVisitors) || 1,
          message: values.message,
          consentGranted: true,
          source: inferredSource,
          landingPath: currentPath || undefined,
          _honeypot: values.honeypot,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.fields && typeof data.fields === "object") {
          setServerErrors(data.fields);
        }
        throw new Error(data.error || "Booking request failed. Please check the fields below.");
      }

      setConfirmedRef(data.referenceNumber || "RDE-SV-RECEIVED");
      reset();
      if (onSuccess) {
        setTimeout(onSuccess, 2000);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again.";
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmedRef) {
    return (
      <div className="p-6 bg-[rgba(36,209,127,0.1)] border border-[rgba(36,209,127,0.3)] rounded-2xl text-center space-y-2">
        <div className="w-10 h-10 rounded-full bg-[#24D17F]/20 text-[#10854d] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h4 className="font-heading font-semibold text-lg text-[#071A28]">
          Tour Request Recorded #{confirmedRef}
        </h4>
        <p className="text-xs text-[#536574]">
          Your tour request is recorded and a confirmation email has been sent to your inbox. Our advisory team will connect with you to finalize visit timings for {propertyName}.
        </p>
        <p className="text-[10px] text-[#647581] italic">
          * Preferred times are subject to advisor and property confirmation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
      {/* Honeypot hidden input field */}
      <div className="hidden">
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("honeypot")}
        />
      </div>

      <div className="p-3 bg-slate-50/80 border border-slate-200/70 rounded-xl text-xs text-[#536574] mb-2 flex items-center gap-2">
        <MapPin className="w-3.5 h-3.5 text-[#0784C8] flex-shrink-0" />
        <span>
          Tour Location: <strong className="text-[#071A28] font-semibold">{propertyName}</strong>
        </span>
      </div>

      <div>
        <Input
          label="Full Name"
          placeholder="e.g. Ramesh Chandra"
          required
          error={serverErrors.name?.[0] || serverErrors.fullName?.[0]}
          {...register("name", {
            onChange: () => {
              clearFieldError("name");
              clearFieldError("fullName");
            },
          })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Input
            label="Phone Number"
            type="tel"
            placeholder="e.g. +91 98765 43210"
            required
            error={serverErrors.phone?.[0]}
            {...register("phone", {
              onChange: () => clearFieldError("phone"),
            })}
          />
        </div>
        <div>
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. name@domain.com"
            required
            error={serverErrors.email?.[0]}
            {...register("email", {
              onChange: () => clearFieldError("email"),
            })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <Input
            label="Preferred Date"
            type="date"
            min={new Date().toISOString().split("T")[0]}
            error={serverErrors.preferredDate?.[0] || serverErrors.preferredStartAt?.[0]}
            {...register("preferredDate", {
              onChange: () => {
                clearFieldError("preferredDate");
                clearFieldError("preferredStartAt");
              },
            })}
          />
        </div>
        <div>
          <Select
            label="Preferred Time Slot"
            options={[
              { value: "10:00 AM", label: "Morning (10:00 AM)" },
              { value: "12:00 PM", label: "Noon (12:00 PM)" },
              { value: "03:00 PM", label: "Afternoon (03:00 PM)" },
              { value: "05:00 PM", label: "Evening (05:00 PM)" },
            ]}
            {...register("preferredTime")}
          />
        </div>
      </div>

      <div>
        <Input
          label="Number of Visitors"
          type="number"
          min={1}
          max={20}
          error={serverErrors.numberOfVisitors?.[0] || serverErrors.visitorCount?.[0]}
          {...register("numberOfVisitors", {
            valueAsNumber: true,
            onChange: () => {
              clearFieldError("numberOfVisitors");
              clearFieldError("visitorCount");
            },
          })}
        />
      </div>

      <div>
        <Textarea
          label="Special Instructions (Optional)"
          placeholder="Details on travel direction, specific plots, or consultation topics..."
          error={serverErrors.message?.[0]}
          {...register("message", {
            onChange: () => clearFieldError("message"),
          })}
        />
      </div>

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Schedule Tour
      </Button>

      <p className="text-[11px] text-[#647581] text-center italic">
        * Preferred times are subject to advisor and property confirmation.
      </p>
    </form>
  );
}
export default SiteVisitForm;
