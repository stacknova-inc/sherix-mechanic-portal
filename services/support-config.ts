/**
 * Official Sherix support destinations, configured per environment via
 * NEXT_PUBLIC_SUPPORT_EMAIL / NEXT_PUBLIC_SUPPORT_PHONE. A malformed value is
 * shown as unavailable instead of guessed.
 */
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
export const SUPPORT_PHONE = process.env.NEXT_PUBLIC_SUPPORT_PHONE;

/**
 * Obviously fictional stand-ins used only while the env vars are unset, so the
 * tel:/mailto: flow can be demoed. They are labelled as placeholders in the UI.
 * TODO: set the env vars (or serve them from GET /support/contacts) and delete these.
 */
export const SUPPORT_PLACEHOLDERS = {
  email: "support@example.com",
  phone: "+1 555 0100",
} as const;

export interface ResolvedSupportContact {
  value: string | undefined;
  isPlaceholder: boolean;
}

export function resolveSupportContact(
  configured: string | undefined,
  placeholder: string,
): ResolvedSupportContact {
  return configured?.trim()
    ? { value: configured, isPlaceholder: false }
    : { value: placeholder, isPlaceholder: true };
}

// Excludes mailto header syntax (?, &, =) so a value cannot add cc/bcc/body fields.
const EMAIL_PATTERN = /^[^\s@<>()[\]\\,;:"?&=/]+@[^\s@<>()[\]\\,;:"?&=/]+\.[A-Za-z]{2,}$/;
const PHONE_ALLOWED_CHARACTERS = /^\+?[\d\s().-]+$/;
const PHONE_DIGIT_RANGE = { min: 7, max: 15 };

export interface SupportDestination {
  /** Human-readable value, as configured. */
  display: string;
  href: string;
}

export function getSupportEmailDestination(value: string | undefined): SupportDestination | null {
  const email = value?.trim();

  if (!email || !EMAIL_PATTERN.test(email)) {
    return null;
  }

  return { display: email, href: `mailto:${email}` };
}

export function getSupportPhoneDestination(value: string | undefined): SupportDestination | null {
  const phone = value?.trim();

  if (!phone || !PHONE_ALLOWED_CHARACTERS.test(phone)) {
    return null;
  }

  const digits = phone.replace(/\D/g, "");

  if (digits.length < PHONE_DIGIT_RANGE.min || digits.length > PHONE_DIGIT_RANGE.max) {
    return null;
  }

  return { display: phone, href: `tel:${phone.startsWith("+") ? "+" : ""}${digits}` };
}
