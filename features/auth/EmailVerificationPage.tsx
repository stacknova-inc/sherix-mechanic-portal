"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, LoaderCircle, Mail, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import { getApiErrorDetails } from "@/services/api-error";
import { resendSignupVerification, verifySignupEmail } from "@/services/auth-service";

function messageFrom(error: unknown, fallback: string) {
  return getApiErrorDetails(error, fallback).message;
}

type Status = "verifying" | "success" | "error" | "idle";

function VerificationCardFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7f8] px-5 py-10 dark:bg-[#121419]">
      <section className="w-full max-w-[500px] rounded-xl border border-[#e6e9ee] bg-white p-7 shadow-auth dark:border-white/10 dark:bg-[#1b1d22] sm:p-10">
        <div className="flex items-center gap-2 text-brand-red">
          <ShieldCheck className="size-6" />
          <span className="font-extrabold">Sherix</span>
        </div>
        <div className="mt-7 flex flex-col items-center py-6 text-center">
          <LoaderCircle className="size-10 animate-spin text-brand-red" />
        </div>
      </section>
    </main>
  );
}

/** Email ownership is a separate gate from compliance approval. No session is created here. */
export function EmailVerificationPage() {
  return (
    <Suspense fallback={<VerificationCardFallback />}>
      <EmailVerificationContent />
    </Suspense>
  );
}

function EmailVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkToken = useMemo(() => searchParams.get("token")?.trim() ?? "", [searchParams]);
  const email = useMemo(() => searchParams.get("email")?.trim() ?? "", [searchParams]);

  const [status, setStatus] = useState<Status>(linkToken ? "verifying" : "idle");
  const [manualToken, setManualToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const hasAttemptedLinkVerification = useRef(false);

  async function verify(token: string) {
    if (!token) {
      setStatus("error");
      setError("Enter the verification token from your email.");
      return;
    }
    setError(null);
    setNotice(null);
    setStatus("verifying");
    try {
      const response = await verifySignupEmail(token);
      setStatus("success");
      setNotice(response.message ?? response.detail ?? "Email verified. You can now sign in.");
      window.setTimeout(() => router.replace("/sign-in"), 1800);
    } catch (requestError) {
      setStatus("error");
      setError(messageFrom(requestError, "This verification link is invalid or has expired. Request a new one below."));
    }
  }

  // Clicking the link in the email should verify automatically; no code to paste.
  useEffect(() => {
    if (linkToken && !hasAttemptedLinkVerification.current) {
      hasAttemptedLinkVerification.current = true;
      verify(linkToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkToken]);

  function submitManualToken(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    verify(manualToken.trim());
  }

  async function resend() {
    if (!email) {
      setError("Return to registration or use the verification link in your email. An email address is required to resend it.");
      return;
    }
    setError(null);
    setNotice(null);
    setIsResending(true);
    try {
      const response = await resendSignupVerification(email);
      setNotice(response.message ?? response.detail ?? "A new verification email has been sent.");
    } catch (requestError) {
      setError(messageFrom(requestError, "We could not resend the verification email. Please try again shortly."));
    } finally {
      setIsResending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7f8] px-5 py-10 dark:bg-[#121419]">
      <section className="w-full max-w-[500px] rounded-xl border border-[#e6e9ee] bg-white p-7 shadow-auth dark:border-white/10 dark:bg-[#1b1d22] sm:p-10">
        <div className="flex items-center gap-2 text-brand-red">
          <ShieldCheck className="size-6" />
          <span className="font-extrabold">Sherix</span>
        </div>

        {status === "verifying" ? (
          <div className="mt-7 flex flex-col items-center py-6 text-center">
            <LoaderCircle className="size-10 animate-spin text-brand-red" />
            <h1 className="mt-5 text-2xl font-extrabold text-brand-dark dark:text-white">Verifying your email…</h1>
            <p className="mt-3 text-sm leading-6 text-[#687386] dark:text-white/65">
              Please wait while we confirm your business email address.
            </p>
          </div>
        ) : status === "success" ? (
          <div className="mt-7 flex flex-col items-center py-6 text-center">
            <CheckCircle2 className="size-10 text-green-600" />
            <h1 className="mt-5 text-2xl font-extrabold text-brand-dark dark:text-white">Email verified</h1>
            <p role="status" className="mt-3 text-sm leading-6 text-[#687386] dark:text-white/65">
              {notice}
            </p>
            <p className="mt-1 text-xs text-[#9aa2ae]">Redirecting you to sign in…</p>
            <Link
              href="/sign-in"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-brand-red px-6 font-bold text-white"
            >
              Continue to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mt-7 text-3xl font-extrabold text-brand-dark dark:text-white">Verify your email</h1>
            <p className="mt-3 text-sm leading-6 text-[#687386] dark:text-white/65">
              {linkToken
                ? "We couldn't verify that link automatically. You can try again below, or request a new verification email."
                : "Use the verification link we sent" +
                  (email ? " to " : " to your representative email") +
                  ". If the link isn't working, paste the token from it below."}
              {email ? <strong className="text-brand-dark dark:text-white"> {email}</strong> : null}
              {linkToken ? null : "."}
            </p>
            {status === "error" && error ? (
              <p role="alert" className="mt-5 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <ShieldAlert className="mt-0.5 size-4 shrink-0" /> {error}
              </p>
            ) : null}
            {notice ? (
              <p role="status" className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                {notice}
              </p>
            ) : null}
            <form className="mt-7 space-y-5" onSubmit={submitManualToken} noValidate>
              <label className="block text-sm font-semibold text-brand-dark dark:text-white">
                Verification token
                <input
                  autoComplete="one-time-code"
                  autoFocus
                  className="mt-2 h-11 w-full rounded-lg border border-[#d8dde5] bg-white px-3 text-base tracking-wide outline-none focus:border-brand-red focus:ring-4 focus:ring-red-100 dark:border-white/15 dark:bg-white/5 dark:text-white"
                  value={manualToken}
                  onChange={(event) => setManualToken(event.target.value)}
                  placeholder="Paste the token from your verification link"
                />
              </label>
              <button className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-red font-bold text-white disabled:opacity-60">
                <CheckCircle2 className="size-4" /> Verify email
              </button>
            </form>
            <div className="mt-6 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={resend}
                disabled={isResending}
                className="inline-flex items-center gap-2 font-bold text-brand-red disabled:opacity-60"
              >
                {isResending ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} Resend
                verification
              </button>
              <Link href="/sign-in" className="inline-flex items-center gap-2 font-semibold text-[#5f6876] dark:text-white/65">
                <Mail className="size-4" /> Return to sign in
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
