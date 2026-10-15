import { Lock } from "lucide-react";

interface PermissionDeniedStateProps {
  title: string;
  description: string;
}

export function PermissionDeniedState({ title, description }: PermissionDeniedStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[#dfe3e9] bg-white px-6 py-14 text-center dark:border-white/10 dark:bg-[#1b1d22]"
    >
      <span className="flex size-10 items-center justify-center rounded-lg bg-[#f4f5f7] text-[#687386] dark:bg-white/10" aria-hidden="true">
        <Lock className="size-5" />
      </span>
      <p className="font-extrabold text-brand-dark dark:text-white">{title}</p>
      <p className="max-w-md text-sm text-[#6f7784] dark:text-white/55">{description}</p>
    </div>
  );
}
