"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

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
  const [confirmedRef, setConfirmedRef] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      numberOfVisitors: 1,
      preferredDate: "",
      preferredTime: "11:00 AM",
      message: "",
      honeypot: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const preferredStartAt = new Date(`${values.preferredDate}T11:00:00+05:30`).toISOString();

      const response = await fetch("/api/site-visits/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: values.name,
          phone: values.phone,
          email: values.email || undefined,
          propertyId,
          preferredStartAt,
          visitorCount: Number(values.numberOfVisitors) || 1,
          message: values.message,
          consentGranted: true,
          _honeypot: values.honeypot,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Form submission failed");
      }

      setConfirmedRef(data.referenceNumber || "RDE-SV-RECEIVED");
      reset();
      if (onSuccess) {
        setTimeout(onSuccess, 2000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmedRef) {
    return (
      <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
        <h4 className="font-serif font-bold text-lg text-emerald-800">
          Tour Request Recorded #{confirmedRef}
        </h4>
        <p className="text-xs text-[#647581]">
          Your request is recorded. Our team will verify dates and contact you to coordinate logistics for {propertyName}.
        </p>
        <p className="text-[10px] text-[#647581] italic">
          * Preferred times are subject to advisor and property confirmation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
      {submitError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800" role="alert">
          {submitError}
        </div>
      )}

      {/* Honeypot hidden input field */}
      <div className="hidden">
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("honeypot")}
        />
      </div>

      <div className="p-3 bg-gray-50 border border-border-color rounded-xl text-xs text-[#647581] mb-2">
        Tour Location: <strong className="text-[#071a28]">{propertyName}</strong>
      </div>

      <Input
        label="Full Name"
        placeholder="e.g. Ramesh Chandra"
        required
        error={errors.name?.message}
        {...register("name", { required: "Name is required" })}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Phone Number"
          type="tel"
          placeholder="e.g. +91 98765 43210"
          required
          error={errors.phone?.message}
          {...register("phone", { required: "Phone is required" })}
        />
        <Input
          label="Email Address"
          type="email"
          placeholder="e.g. name@domain.com"
          error={errors.email?.message}
          {...register("email")}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <Input
            label="Preferred Date"
            type="date"
            required
            min={new Date().toISOString().split("T")[0]}
            error={errors.preferredDate?.message}
            {...register("preferredDate", { required: "Date is required" })}
          />
        </div>
        <Select
          label="Preferred Time Slot"
          required
          options={[
            { value: "10:00 AM", label: "Morning (10:00 AM)" },
            { value: "12:00 PM", label: "Noon (12:00 PM)" },
            { value: "03:00 PM", label: "Afternoon (03:00 PM)" },
            { value: "05:00 PM", label: "Evening (05:00 PM)" },
          ]}
          {...register("preferredTime")}
        />
      </div>

      <Input
        label="Number of Visitors"
        type="number"
        min={1}
        max={20}
        required
        error={errors.numberOfVisitors?.message}
        {...register("numberOfVisitors", { valueAsNumber: true })}
      />

      <Textarea
        label="Special Instructions (Optional)"
        placeholder="Details on travel direction, specific plots, or consultation topics..."
        {...register("message")}
      />

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
