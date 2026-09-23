import { EmailVerificationPage } from "@/features/auth/EmailVerificationPage";

/**
 * The verification email links to `{BASE_URL}/verify-email?token=...` (root path),
 * while the in-app flow lives under `/company-onboarding/verify-email`. This route
 * mirrors that page at the root so the emailed link resolves instead of 404ing.
 */
export default function VerifyEmailRootRoute() {
  return <EmailVerificationPage />;
}
