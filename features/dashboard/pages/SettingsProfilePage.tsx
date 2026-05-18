"use client";

import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileText,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { PageHeader } from "@/features/dashboard/components/PageHeader";
import { DashboardShell } from "@/features/dashboard/layouts/DashboardShell";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/utils/cn";

const settingsSections = [
  "My Profile",
  "Security",
  "Team",
  "Documents",
  "Notifications",
  "Billing",
  "Data Export",
];

function valueOrFallback(value: string | undefined, fallback: string) {
  return value?.trim() ? value : fallback;
}

function fileName(file: File | null | undefined, fallback: string) {
  return file?.name ?? fallback;
}

function EditButton() {
  return (
    <button className="flex h-9 items-center gap-2 rounded-lg border border-[#edf0f3] bg-white px-4 text-[12px] font-extrabold text-[#5f6672] transition hover:border-brand-red hover:text-brand-red">
      Edit
      <UserRound className="size-3.5" />
    </button>
  );
}

function DetailItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#9aa1ad]">
        {label}
      </p>
      <p className="flex min-h-5 items-center gap-2 text-[13px] font-extrabold leading-5 text-brand-dark">
        {icon ? <span className="text-brand-red">{icon}</span> : null}
        <span className="break-words">{value}</span>
      </p>
    </div>
  );
}

function ProfileSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[8px] border border-[#edf0f3] bg-white p-5 shadow-card md:p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-[15px] font-extrabold text-brand-dark">{title}</h2>
        <EditButton />
      </div>
      {children}
    </section>
  );
}

export function SettingsProfilePage() {
  const { formData, files, user } = useAuthStore();

  const fullName = valueOrFallback(formData.fullName || user?.name, "Graca Yakey");
  const personalEmail = valueOrFallback(
    formData.personalEmail || user?.email,
    "admin@sherix.com",
  );
  const servicesOffered = valueOrFallback(
    formData.servicesOffered,
    "Express Delivery, Heavy Cargo",
  );
  const workingHours = valueOrFallback(
    formData.workingHours,
    "Mon - Sat | 08:00 AM - 09:00 PM",
  );

  return (
    <DashboardShell>
      <PageHeader
        title="Account Settings"
        description="Manage the primary admin profile, credentials, and onboarding documents."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="rounded-[8px] border border-[#edf0f3] bg-white p-3 shadow-card">
          <nav className="space-y-1">
            {settingsSections.map((section) => {
              const active = section === "My Profile";

              return (
                <button
                  key={section}
                  className={cn(
                    "flex h-10 w-full items-center rounded-lg px-4 text-left text-[12px] font-extrabold transition",
                    active
                      ? "bg-[#ffe8ee] text-brand-red"
                      : "text-[#737b88] hover:bg-[#f7f8fa] hover:text-brand-dark",
                  )}
                >
                  {section}
                </button>
              );
            })}
          </nav>
          <button className="mt-5 flex h-10 w-full items-center rounded-lg px-4 text-left text-[12px] font-extrabold text-brand-red transition hover:bg-[#fff4f6]">
            Delete Account
          </button>
        </aside>

        <div className="space-y-5">
          <section className="rounded-[8px] border border-[#edf0f3] bg-white p-5 shadow-card md:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-[76px] shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#e4072f,#f8c3cd)] text-[24px] font-extrabold text-white shadow-[0_14px_26px_rgba(228,7,47,0.18)]">
                  {fullName
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="text-[18px] font-extrabold text-brand-dark">{fullName}</p>
                  <p className="mt-1 text-[12px] font-extrabold text-[#6f7784]">
                    {user?.role ?? "Provider Admin"}
                  </p>
                  <p className="mt-1 text-[12px] font-medium text-[#8f96a3]">
                    Sherix Admin Workspace
                  </p>
                </div>
              </div>
              <EditButton />
            </div>
          </section>

          <ProfileSection title="Admin Profile">
            <div className="grid gap-x-10 gap-y-6 md:grid-cols-2">
              <DetailItem
                label="Full Name"
                value={fullName}
                icon={<UserRound className="size-4" />}
              />
              <DetailItem
                label="Personal Email"
                value={personalEmail}
                icon={<Mail className="size-4" />}
              />
              <DetailItem
                label="Admin Password"
                value="Configured"
                icon={<LockKeyhole className="size-4" />}
              />
              <DetailItem
                label="Signed Agreement"
                value={
                  formData.signedAgreementAccepted
                    ? "Read and accepted"
                    : "Awaiting acceptance"
                }
                icon={<CheckCircle2 className="size-4" />}
              />
            </div>
          </ProfileSection>

          <ProfileSection title="Service Information">
            <div className="grid gap-x-10 gap-y-6 md:grid-cols-2">
              <DetailItem
                label="Services Offered"
                value={servicesOffered}
                icon={<BriefcaseBusiness className="size-4" />}
              />
              <DetailItem
                label="Working Hours"
                value={workingHours}
                icon={<Clock3 className="size-4" />}
              />
            </div>
          </ProfileSection>

          <ProfileSection title="Verification Documents">
            <div className="grid gap-x-10 gap-y-6 md:grid-cols-2">
              <DetailItem
                label="Ghana Card"
                value={fileName(files.ghanaCard, "Not uploaded")}
                icon={<FileText className="size-4" />}
              />
              <DetailItem
                label="Insurance Upload"
                value={fileName(files.insuranceUpload, "Not uploaded")}
                icon={<ShieldCheck className="size-4" />}
              />
            </div>
          </ProfileSection>
        </div>
      </div>
    </DashboardShell>
  );
}
