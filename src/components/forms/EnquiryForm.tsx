"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enquirySchema, EnquirySchema } from "@/lib/validations/enquiry";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

interface EnquiryFormProps {
  propertyId?: string;
  propertySlug?: string;
  preferredLocation?: string;
  propertyType?: "Residential Plot" | "Commercial Plot" | "Any";
  onSuccess?: () => void;
}

export function EnquiryForm({
  propertyId,
  propertySlug,
  preferredLocation = "",
  propertyType = "Any",
  onSuccess,
}: EnquiryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EnquirySchema>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      preferredLocation,
      propertyType,
      budget: "",
      propertyId,
      propertySlug,
      honeypot: "",
    },
  });

  const onSubmit = async (values: EnquirySchema) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch("/api/enquiries", {
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
          Enquiry Submitted Successfully
        </h4>
        <p className="text-sm text-text-muted">
          Thank you. A Ratiwal consultant will review your submission and connect with you shortly.
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
        <label htmlFor="honeypot">Do not fill this out if you are human</label>
        <input
          id="honeypot"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("honeypot")}
        />
      </div>

      <Input
        label="Full Name"
        placeholder="e.g. Rajesh Kumar"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Preferred Location"
          required
          placeholder="Select location"
          options={[
            { value: "Jaipur", label: "Jaipur" },
            { value: "Ajmer", label: "Ajmer" },
            { value: "Navi Mumbai", label: "Navi Mumbai" },
            { value: "Panvel", label: "Panvel" },
            { value: "Bhiwadi", label: "Bhiwadi" },
            { value: "Other Locations", label: "Other Locations" },
          ]}
          error={errors.preferredLocation?.message}
          {...register("preferredLocation")}
        />
        <Select
          label="Property Type"
          required
          options={[
            { value: "Any", label: "Any Plot Type" },
            { value: "Residential Plot", label: "Residential Plot" },
            { value: "Commercial Plot", label: "Commercial Plot" },
          ]}
          error={errors.propertyType?.message}
          {...register("propertyType")}
        />
      </div>

      <Select
        label="Budget Range"
        required
        placeholder="Select budget segment"
        options={[
          { value: "Under 10 Lakhs", label: "Under 10 Lakhs" },
          { value: "10 Lakhs - 25 Lakhs", label: "10 Lakhs - 25 Lakhs" },
          { value: "25 Lakhs - 50 Lakhs", label: "25 Lakhs - 50 Lakhs" },
          { value: "50 Lakhs - 1 Crore", label: "50 Lakhs - 1 Crore" },
          { value: "Above 1 Crore", label: "Above 1 Crore" },
          { value: "Price on Request", label: "Price on Request" },
        ]}
        error={errors.budget?.message}
        {...register("budget")}
      />

      <Textarea
        label="Message"
        placeholder="Please enter your enquiry or investment parameters..."
        required
        error={errors.message?.message}
        {...register("message")}
      />

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Send Enquiry
      </Button>
    </form>
  );
}
export default EnquiryForm;
