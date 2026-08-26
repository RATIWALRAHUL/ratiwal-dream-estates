import { PasswordRequirementCheck } from "@/types/dashboard-auth";

/**
 * Pure client- and server-safe password validation helper
 * Validates minimum 8 characters only
 */
export function validatePasswordRequirements(password: string): {
  isValid: boolean;
  requirements: PasswordRequirementCheck[];
} {
  const requirements: PasswordRequirementCheck[] = [
    { id: "LENGTH", label: "At least 8 characters long", met: password.length >= 8 },
  ];
  const isValid = requirements.every((r) => r.met);
  return { isValid, requirements };
}
