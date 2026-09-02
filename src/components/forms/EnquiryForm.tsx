"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface EnquiryFormProps {
  propertyId?: string;
  propertySlug?: string;
  preferredLocation?: string;
  propertyType?: "Residential Plot" | "Commercial Plot" | "Any";
  onSuccess?: () => void;
}

interface FormValues {
  name: string;
  phone: string;
  email: string;
  preferredLocation: string;
  propertyType: string;
  budget: string;
  message: string;
  propertyId?: string;
  propertySlug?: string;
  honeypot?: string;
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
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
  const [confirmedRef, setConfirmedRef] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      preferredLocation,
      propertyType,
      budget: "",
      propertyId,
      propertySlug,
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
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
      const inferredSource = propertyId || propertySlug
        ? "PROPERTY_DETAIL"
        : currentPath.includes("contact")
        ? "CONTACT_PAGE"
        : currentPath.includes("location")
        ? "LOCATION_PAGE"
        : currentPath === "/"
        ? "HOMEPAGE_CTA"
        : "DIRECT";

      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: values.name,
          name: values.name,
          phone: values.phone,
          email: values.email || undefined,
          preferredLocation: values.preferredLocation,
          propertyType: values.propertyType,
          budget: values.budget,
          message: values.message,
          propertyId,
          propertySlug,
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
        throw new Error(data.error || "Submission failed. Please check the fields below.");
      }

      setConfirmedRef(data.referenceNumber || "RDE-ENQ-CONFIRMED");
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
          Enquiry Submitted Successfully
        </h4>
        <p className="text-xs text-[#536574]">
          Reference ID: <strong className="font-mono text-[#0784C8]">#{confirmedRef}</strong>
        </p>
        <p className="text-xs text-[#536574]">
          Thank you. We have sent a confirmation email to your inbox. A senior Ratiwal land advisor will connect with you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
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

      <div>
        <Input
          label="Full Name"
          placeholder="e.g. Rajesh Kumar"
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
            placeholder="e.g. 9876543210"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Select
            label="Preferred Location"
            placeholder="Select location"
            options={[
              { value: "Jaipur", label: "Jaipur" },
              { value: "Ajmer", label: "Ajmer" },
              { value: "Navi Mumbai", label: "Navi Mumbai" },
              { value: "Panvel", label: "Panvel" },
              { value: "Bhiwadi", label: "Bhiwadi" },
              { value: "Other Locations", label: "Other Locations" },
            ]}
            error={serverErrors.preferredLocation?.[0]}
            {...register("preferredLocation", {
              onChange: () => clearFieldError("preferredLocation"),
            })}
          />
        </div>
        <div>
          <Select
            label="Property Type"
            options={[
              { value: "Any", label: "Any Plot Type" },
              { value: "Residential Plot", label: "Residential Plot" },
              { value: "Commercial Plot", label: "Commercial Plot" },
            ]}
            error={serverErrors.propertyType?.[0]}
            {...register("propertyType", {
              onChange: () => clearFieldError("propertyType"),
            })}
          />
        </div>
      </div>

      <div>
        <Select
          label="Budget Range"
          placeholder="Select budget segment"
          options={[
            { value: "Under 10 Lakhs", label: "Under 10 Lakhs" },
            { value: "10 Lakhs - 25 Lakhs", label: "10 Lakhs - 25 Lakhs" },
            { value: "25 Lakhs - 50 Lakhs", label: "25 Lakhs - 50 Lakhs" },
            { value: "50 Lakhs - 1 Crore", label: "50 Lakhs - 1 Crore" },
            { value: "Above 1 Crore", label: "Above 1 Crore" },
            { value: "Price on Request", label: "Price on Request" },
          ]}
          error={serverErrors.budget?.[0]}
          {...register("budget", {
            onChange: () => clearFieldError("budget"),
          })}
        />
      </div>

      <div>
        <Textarea
          label="Message"
          placeholder="Please enter your enquiry or investment parameters..."
          error={serverErrors.message?.[0]}
          {...register("message", {
            onChange: () => clearFieldError("message"),
          })}
        />
      </div>

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Send Enquiry
      </Button>
    </form>
  );
}
export default EnquiryForm;
