export type ActionErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "DUPLICATE_SLUG"
  | "DUPLICATE_PLOT_NUMBER"
  | "DUPLICATE_MICRO_MARKET"
  | "PUBLISHED_PROPERTIES_EXIST"
  | "INVALID_STATUS_TRANSITION"
  | "INVALID_ASSIGNEE"
  | "DUPLICATE_SUBMISSION"
  | "CONSENT_REQUIRED"
  | "ALREADY_ARCHIVED"
  // Site Visit Scheduling
  | "INVALID_ADVISOR"
  | "ADVISOR_UNAVAILABLE"
  | "SLOT_UNAVAILABLE"
  | "PROPERTY_UNAVAILABLE"
  | "PAST_DATE"
  | "OUTSIDE_BOOKING_WINDOW"
  | "DUPLICATE_REQUEST"
  | "DATABASE_ERROR";

export type ActionResult<T = undefined> =
  | {
      success: true;
      data?: T;
      message: string;
    }
  | {
      success: false;
      code: ActionErrorCode;
      message: string;
      fieldErrors?: Record<string, string[]>;
    };
