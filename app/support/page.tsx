"use client";

import { PageHeader } from "@/features/dashboard/components/PageHeader";
import { DashboardShell } from "@/features/dashboard/layouts/DashboardShell";
import { SupportChannels } from "@/features/support/components/SupportChannels";
import { SupportChat } from "@/features/support/components/SupportChat";
import {
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  SUPPORT_PLACEHOLDERS,
  resolveSupportContact,
} from "@/services/support-config";

const email = resolveSupportContact(SUPPORT_EMAIL, SUPPORT_PLACEHOLDERS.email);
const phone = resolveSupportContact(SUPPORT_PHONE, SUPPORT_PLACEHOLDERS.phone);

export default function SupportPage() {
  return (
    <DashboardShell>
      <PageHeader
        title="Support"
        description="Get help from the Sherix team with your account, mechanics, payouts, or Service Requests."
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <SupportChat />
        <aside aria-label="Other ways to contact support">
          <SupportChannels
            email={email.value}
            phone={phone.value}
            emailIsPlaceholder={email.isPlaceholder}
            phoneIsPlaceholder={phone.isPlaceholder}
          />
        </aside>
      </div>
    </DashboardShell>
  );
}
