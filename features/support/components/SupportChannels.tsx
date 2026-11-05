import type { LucideIcon } from "lucide-react";
import { Mail, Phone } from "lucide-react";
import { SampleDataBadge } from "@/features/dashboard/components/SampleDataBadge";
import {
  getSupportEmailDestination,
  getSupportPhoneDestination,
} from "@/services/support-config";

interface SupportChannelsProps {
  email: string | undefined;
  phone: string | undefined;
  /** True when the value is a placeholder because the env var is not set. */
  emailIsPlaceholder?: boolean;
  phoneIsPlaceholder?: boolean;
}

function ChannelCard({
  icon: Icon,
  title,
  description,
  isPlaceholder,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  isPlaceholder: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-label={title}
      className="flex flex-col rounded-xl border border-[#eef0f3] bg-white p-5 shadow-card dark:border-white/10 dark:bg-[#1b1d22]"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex size-9 items-center justify-center rounded-lg bg-[#ffe5ec] text-brand-red" aria-hidden="true">
          <Icon className="size-4" />
        </span>
        {isPlaceholder ? <SampleDataBadge /> : null}
      </div>
      <h2 className="mt-4 text-base font-extrabold text-brand-dark dark:text-white">{title}</h2>
      <p className="mt-1 text-sm text-[#6f7784] dark:text-white/55">{description}</p>
      <div className="mt-5">{children}</div>
      {isPlaceholder ? (
        <p className="mt-3 text-xs text-[#8f96a3]">Placeholder shown until the official contact is configured.</p>
      ) : null}
    </section>
  );
}

function Unavailable({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg bg-[#f4f5f7] px-3 py-2 text-xs font-semibold text-[#596170] dark:bg-white/5 dark:text-white/60">
      {children}
    </p>
  );
}

const actionClassName =
  "inline-flex h-10 max-w-full items-center truncate rounded-lg bg-brand-red px-4 text-sm font-extrabold text-white transition hover:bg-[#c90629] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2";

/** Phone and email contact options. */
export function SupportChannels({
  email,
  phone,
  emailIsPlaceholder = false,
  phoneIsPlaceholder = false,
}: SupportChannelsProps) {
  const emailDestination = getSupportEmailDestination(email);
  const phoneDestination = getSupportPhoneDestination(phone);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
      <ChannelCard
        icon={Phone}
        title="Call support"
        description="Speak to the Sherix support team by phone."
        isPlaceholder={Boolean(phoneDestination) && phoneIsPlaceholder}
      >
        {phoneDestination ? (
          <a
            href={phoneDestination.href}
            aria-label={`Call Sherix support on ${phoneDestination.display}`}
            className={actionClassName}
          >
            {phoneDestination.display}
          </a>
        ) : (
          <Unavailable>A support phone number has not been configured for this portal.</Unavailable>
        )}
      </ChannelCard>

      <ChannelCard
        icon={Mail}
        title="Email support"
        description="Send the details of your issue, including any Service Request ID."
        isPlaceholder={Boolean(emailDestination) && emailIsPlaceholder}
      >
        {emailDestination ? (
          <a
            href={emailDestination.href}
            aria-label={`Email Sherix support at ${emailDestination.display}`}
            className={actionClassName}
          >
            {emailDestination.display}
          </a>
        ) : (
          <Unavailable>A support email address has not been configured for this portal.</Unavailable>
        )}
      </ChannelCard>
    </div>
  );
}
