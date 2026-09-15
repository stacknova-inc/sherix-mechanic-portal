"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { CheckCircle2, LoaderCircle, Mail, RefreshCw, ShieldCheck } from "lucide-react";
import { getApiErrorDetails } from "@/services/api-error";
import { resendSignupVerification, verifySignupEmail } from "@/services/auth-service";

function messageFrom(error: unknown, fallback: string) {
  return getApiErrorDetails(error, fallback).message;
}

/** Email ownership is a separate gate from compliance approval. No session is created here. */
export function EmailVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = useMemo(() => searchParams.get("email")?.trim() ?? "", [searchParams]);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = code.trim();
    if (!token) {
      setError("Enter the verification code or token from your email.");
      return;
    }
    setError(null);
    setNotice(null);
    setIsVerifying(true);
    try {
      const response = await verifySignupEmail(token);
      setNotice(response.message ?? response.detail ?? "Email verified. You can now sign in while we review your company.");
      window.setTimeout(() => router.replace("/sign-in"), 900);
    } catch (requestError) {
      setError(messageFrom(requestError, "We could not verify that code. It may have expired or already been used."));
    } finally {
      setIsVerifying(false);
    }
  }

  async function resend() {
    if (!email) {
      setError("Return to registration or use the verification link in your email. An email address is required to resend a code.");
      return;
    }
    setError(null);
    setNotice(null);
    setIsResending(true);
    try {
      const response = await resendSignupVerification(email);
      setNotice(response.message ?? response.detail ?? "A new verification message has been sent.");
    } catch (requestError) {
      setError(messageFrom(requestError, "We could not resend the verification message. Please try again shortly."));
    } finally {
      setIsResending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7f8] px-5 py-10 dark:bg-[#121419]">
      <section className="w-full max-w-[500px] rounded-xl border border-[#e6e9ee] bg-white p-7 shadow-auth dark:border-white/10 dark:bg-[#1b1d22] sm:p-10">
        <div className="flex items-center gap-2 text-brand-red"><ShieldCheck className="size-6" /><span className="font-extrabold">Sherix</span></div>
        <h1 className="mt-7 text-3xl font-extrabold text-brand-dark dark:text-white">Verify your email</h1>
        <p className="mt-3 text-sm leading-6 text-[#687386] dark:text-white/65">
          Enter the code or token we sent{email ? <> to <strong className="text-brand-dark dark:text-white">{email}</strong></> : " to your representative email"}. Email verification is required before sign-in; company features remain unavailable until compliance approval.
        </p>
        <form className="mt-7 space-y-5" onSubmit={verify} noValidate>
          <label className="block text-sm font-semibold text-brand-dark dark:text-white">
            Verification code or token
            <input
              autoComplete="one-time-code"
              autoFocus
              className="mt-2 h-11 w-full rounded-lg border border-[#d8dde5] bg-white px-3 text-base tracking-wide outline-none focus:border-brand-red focus:ring-4 focus:ring-red-100 dark:border-white/15 dark:bg-white/5 dark:text-white"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              aria-describedby={error ? "verification-error" : notice ? "verification-notice" : undefined}
            />
          </label>
          {error ? <p id="verification-error" role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          {notice ? <p id="verification-notice" role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{notice}</p> : null}
          <button disabled={isVerifying} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-red font-bold text-white disabled:opacity-60">
            {isVerifying ? <LoaderCircle className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />} Verify email
          </button>
        </form>
        <div className="mt-6 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={resend} disabled={isResending} className="inline-flex items-center gap-2 font-bold text-brand-red disabled:opacity-60">
            {isResending ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} Resend verification
          </button>
          <Link href="/sign-in" className="inline-flex items-center gap-2 font-semibold text-[#5f6876] dark:text-white/65"><Mail className="size-4" /> Return to sign in</Link>
        </div>
      </section>
    </main>
  );
}
