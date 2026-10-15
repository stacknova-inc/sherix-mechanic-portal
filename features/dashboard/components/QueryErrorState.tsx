import { Lock, RotateCw, TriangleAlert } from "lucide-react";
import { getApiErrorDetails } from "@/services/api-error";

interface QueryErrorStateProps {
  error: unknown;
  /** What failed to load, e.g. "Service Requests". */
  subject: string;
  onRetry?: () => void;
}

/**
 * Section-level error state. A 403 renders as a permission state (retrying will
 * not help); other failures show the backend message with a retry action.
 * 401s are handled globally by the HTTP client, which ends the session.
 */
export function QueryErrorState({ error, subject, onRetry }: QueryErrorStateProps) {
  const details = getApiErrorDetails(error, `Unable to load ${subject}.`);
  const isForbidden = details.status === 403;
  const Icon = isForbidden ? Lock : TriangleAlert;

  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-lg border border-red-100 bg-red-50/60 px-6 py-10 text-center dark:border-red-500/20 dark:bg-red-500/5"
    >
      <Icon className="size-6 text-brand-red" aria-hidden="true" />
      <div>
        <p className="font-extrabold text-brand-dark dark:text-white">
          {isForbidden ? `You don't have permission to view ${subject}` : `Unable to load ${subject}`}
        </p>
        <p className="mt-1 text-sm text-[#6f7784] dark:text-white/55">
          {isForbidden
            ? "Your account's role does not allow access to this information. Contact your company administrator if you need it."
            : details.message}
        </p>
      </div>
      {!isForbidden && onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#e5e8ee] bg-white px-4 text-xs font-extrabold text-[#4b535f] transition hover:border-brand-red hover:text-brand-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red dark:border-white/10 dark:bg-white/5 dark:text-white/80"
        >
          <RotateCw className="size-3.5" aria-hidden="true" />
          Try again
        </button>
      ) : null}
    </div>
  );
}
