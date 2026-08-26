export interface AdminAuthSessionDTO {
  id: string;
  ipAddress: string;
  userAgent: string;
  browser: string;
  os: string;
  deviceType: string;
  locationCity?: string;
  locationCountry?: string;
  lastActiveAt: string;
  createdAt: string;
  isCurrent: boolean;
}

export interface PasswordRequirementCheck {
  id: string;
  label: string;
  met: boolean;
}

export type MfaMethod = "AUTHENTICATOR_APP" | "RECOVERY_CODE" | "PASSKEY";

export interface PasswordResetState {
  identifier: string;
  maskedIdentifier: string;
  resetRequestId: string;
  expiresAt: string;
}
