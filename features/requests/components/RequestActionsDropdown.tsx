import {
  CheckCircle2,
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";

const actions = [
  { label: "View request", icon: Eye },
  { label: "Edit request", icon: Pencil },
  { label: "Approve request", icon: CheckCircle2 },
  { label: "Reject request", icon: XCircle },
  { label: "Delete request", icon: Trash2, danger: true },
];

export function RequestActionsDropdown() {
  return (
    <details className="group relative">
      <summary className="flex size-9 cursor-pointer list-none items-center justify-center rounded-lg border border-[#eef0f3] bg-white text-[#6f7784] transition hover:border-brand-red hover:text-brand-red dark:border-white/10 dark:bg-white/5 dark:text-white/70 [&::-webkit-details-marker]:hidden">
        <MoreHorizontal className="size-4" />
      </summary>
      <div className="absolute right-0 z-30 mt-2 w-48 overflow-hidden rounded-xl border border-[#eef0f3] bg-white p-1 shadow-[0_18px_40px_rgba(24,28,36,0.14)] dark:border-white/10 dark:bg-[#202329]">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.label}
              className={`flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-xs font-extrabold transition ${
                action.danger
                  ? "text-brand-red hover:bg-[#fff0f4]"
                  : "text-[#4d5562] hover:bg-[#f7f8fa] dark:text-white/75 dark:hover:bg-white/10"
              }`}
            >
              <Icon className="size-4" />
              {action.label}
            </button>
          );
        })}
      </div>
    </details>
  );
}
