"use client";

import Link from "next/link";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

export default function CompanyVerificationStatusRoute() {
  const user = useAuthStore((state) => state.user);
  const rejected = user?.companyVerificationStatus === "rejected";
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7f8] px-5 dark:bg-[#121419]">
      <section className="w-full max-w-lg rounded-xl border border-[#e6e9ee] bg-white p-8 text-center shadow-auth dark:border-white/10 dark:bg-[#1b1d22]">
        {rejected ? <ShieldAlert className="mx-auto size-12 text-brand-red" /> : <ShieldCheck className="mx-auto size-12 text-brand-red" />}
        <h1 className="mt-5 text-2xl font-extrabold text-brand-dark dark:text-white">{rejected ? "Company verification needs attention" : "Company verification is pending"}</h1>
        <p className="mt-3 text-sm leading-6 text-[#687386] dark:text-white/65">
          {rejected ? user?.companyVerificationReason || "Your submitted information needs review. Contact support to resubmit." : "Your company is being reviewed. Dashboard, staff, mechanic, services, and coverage controls will unlock after approval."}
        </p>
        <Link href="/sign-in" className="mt-7 inline-flex h-10 items-center rounded-lg bg-brand-red px-5 text-sm font-bold text-white">Return to sign in</Link>
      </section>
    </main>
  );
}
