"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, Mail, RefreshCw, ShieldCheck } from "lucide-react";

export function VerificationPending() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-brand-dark">
      <header className="flex h-[64px] items-center px-6 text-[11px] font-semibold text-[#667080] sm:px-10">
        <Link href="/" className="flex items-center gap-2">
          <ArrowLeft className="size-3.5" />
          Back
        </Link>
        <div className="ml-8 flex items-center gap-2 text-[14px] font-extrabold text-brand-dark">
          <span className="flex size-7 items-center justify-center rounded-[7px] bg-brand-red text-white">
            <ShieldCheck className="size-4" />
          </span>
          Sherix
        </div>
        <a className="ml-auto">Help Center</a>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 pb-20 pt-10">
        <section className="flex w-full max-w-[640px] flex-col items-center text-center">
          <div className="mb-14 flex size-[138px] items-center justify-center rounded-full bg-[#fce8ed] shadow-[inset_0_0_0_22px_rgba(255,255,255,0.35)]">
            <span className="flex size-[104px] items-center justify-center rounded-full bg-[#fdeef2] shadow-[0_16px_34px_rgba(224,25,58,0.11)]">
              <RefreshCw className="size-[54px] stroke-[2.6] text-brand-red" />
            </span>
          </div>

          <h1 className="max-w-[520px] text-[34px] font-extrabold leading-[0.98] tracking-[-0.02em] text-black sm:text-[44px]">
            We&apos;re verifying your account!
          </h1>
          <p className="mt-7 max-w-[560px] text-[14px] font-medium leading-6 text-[#687386]">
            Your company registration has been submitted successfully. You will receive an email verifying your sign up process.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Link
              href="/sign-in"
              className="flex h-[42px] w-[164px] items-center justify-center rounded-[8px] bg-brand-red text-[12px] font-extrabold text-white shadow-[0_14px_24px_rgba(228,7,47,0.2)]"
            >
              Return to Login
            </Link>
            <a className="flex h-[42px] items-center gap-2 px-2 text-[11px] font-semibold text-[#606a78]">
              <Mail className="size-3.5" />
              Contact Support
            </a>
          </div>
        </section>
      </main>

      <footer className="flex min-h-[56px] flex-col items-center justify-center gap-3 px-8 text-[11px] font-medium text-[#98a0ac] sm:flex-row">
        <span className="sm:mr-auto">© 2026 Sherix. All rights reserved.</span>
        <nav className="flex items-center gap-8">
          <a>Privacy Policy</a>
          <a>Terms of Service</a>
          <a className="flex items-center gap-1">
            Sherix Global <ExternalLink className="size-3" />
          </a>
        </nav>
      </footer>
    </div>
  );
}
