"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { siteVisitSchema, SiteVisitSchema } from "@/lib/validations/site-visit";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

interface SiteVisitFormProps {
  propertyId: string;
  propertyName: string;
  onSuccess?: () => void;
}

export function SiteVisitForm({
  propertyId,
  propertyName,
  onSuccess,
}: SiteVisitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SiteVisitSchema>({
    resolver: zodResolver(siteVisitSchema),
    defaultValues: {
      propertyId,
      propertyName,
      numberOfVisitors: 1,
      preferredDate: "",
      preferredTime: "",
      message: "",
      honeypot: "",
    },
  });

  const onSubmit = async (values: SiteVisitSchema) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch("/api/site-visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Form submission failed");
      }

      setSubmitSuccess(true);
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

  if (submitSuccess) {
    return (
      <div className="p-6 bg-success-color/10 border border-success-color/20 rounded text-center">
        <h4 className="font-heading font-semibold text-lg text-success-color mb-2">
          Site Visit Scheduled
        </h4>
        <p className="text-sm text-text-muted">
          Your request is recorded. Our team will verify dates and contact you to coordinate logisitics.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
      {submitError && (
        <div className="p-4 bg-error-color/10 border border-error-color/20 rounded text-sm text-error-color" role="alert">
          {submitError}
        </div>
      )}

      {/* Honeypot hidden input field to capture spam bots */}
      <div className="visually-hidden">
        <label htmlFor="visit-honeypot">Do not fill this out if you are human</label>
        <input
          id="visit-honeypot"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("honeypot")}
        />
      </div>

      <div className="p-3 bg-gray-50 border border-border-color rounded text-xs text-text-muted mb-2">
        Tour Location: <strong className="text-text-main">{propertyName}</strong>
      </div>

      <Input
        label="Full Name"
        placeholder="e.g. Ramesh Chandra"
        required
        error={errors.name?.message}
        {...register("name")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Phone Number"
          type="tel"
          placeholder="e.g. +91XXXXXXXXXX"
          required
          error={errors.phone?.message}
          {...register("phone")}
        />
        <Input
          label="Email Address"
          type="email"
          placeholder="e.g. name@domain.com"
          required
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
            error={errors.preferredDate?.message}
            {...register("preferredDate")}
          />
        </div>
        <Select
          label="Preferred Time Slot"
          required
          placeholder="Select slot"
          options={[
            { value: "10:00 AM - 12:00 PM", label: "Morning (10AM - 12PM)" },
            { value: "12:00 PM - 02:00 PM", label: "Midday (12PM - 2PM)" },
            { value: "02:00 PM - 04:00 PM", label: "Afternoon (2PM - 4PM)" },
            { value: "04:00 PM - 06:00 PM", label: "Evening (4PM - 6PM)" },
          ]}
          error={errors.preferredTime?.message}
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
        error={errors.message?.message}
        {...register("message")}
      />

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Schedule Tour
      </Button>
    </form>
  );
}
export default SiteVisitForm;
