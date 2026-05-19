import {
  Check,
  CircleHelp,
  Expand,
  Filter,
  X,
} from "lucide-react";
import { DashboardShell } from "@/features/dashboard/layouts/DashboardShell";

const notifications = [
  {
    name: "Santi Cazorla",
    action: "Reply your comment in Knowledgebase Adding agent...",
    preview: "Praesent ultricies lacus in ligula volutpat feugiat.",
    date: "7 March 2023",
    time: "12:12 AM",
    unread: true,
    avatar: "SC",
    tone: "bg-[#111827] text-white",
  },
  {
    name: "Granit Xhaka",
    action: "Assigned in Number Ticket",
    ticket: "TC-192",
    date: "7 March 2023",
    time: "12:12 AM",
    unread: true,
    avatar: "GX",
    tone: "bg-[#a5b0b8] text-white",
  },
  {
    name: "Martin Odegaard",
    action: "Mention you in comment conversation ticket",
    ticket: "TC-192",
    preview: "Yes, I wanted to order the blue iPhone case but accidentally ordered the red one.",
    date: "7 March 2023",
    time: "12:12 AM",
    unread: true,
    avatar: "MO",
    tone: "bg-[#a5b0b8] text-white",
    reply: true,
  },
  {
    name: "Darlene Robertson",
    action: "Change type Ticket to",
    date: "6 March 2023",
    time: "12:12 AM",
    avatar: "DR",
    tone: "bg-[#87533d] text-white",
    pill: "Incident",
  },
  {
    name: "Santi Cazorla",
    action: "Reply your comment in Conversation Ticket Details",
    ticket: "TC-192",
    preview: "Sure, the order number is TC-192",
    date: "6 March 2023",
    time: "12:12 AM",
    avatar: "SC",
    tone: "bg-[#1f2937] text-white",
    reply: true,
  },
  {
    name: "Xavi Hernandez",
    action: "Assigned in Number Ticket",
    ticket: "TC-191",
    date: "6 March 2023",
    time: "12:12 AM",
    avatar: "XH",
    tone: "bg-[#a5b0b8] text-white",
  },
  {
    name: "Santi Cazorla",
    action: "Reply your comment in Conversation Ticket Details",
    ticket: "TC-192",
    preview: "Sure, the order number is TC-192",
    date: "6 March 2023",
    time: "12:12 AM",
    avatar: "SC",
    tone: "bg-[#111827] text-white",
    reply: true,
  },
];

export default function NotificationsPage() {
  return (
    <DashboardShell>
     
        <section className="flex min-h-[720px] items-start">
          <div className="w-full max-w-[690px] overflow-hidden rounded-[8px] bg-white shadow-[0_24px_80px_rgba(23,25,31,0.22)] ring-1 ring-black/5">
            <header className="flex h-[74px] items-center border-b border-[#eef0f3] px-5 sm:px-7">
              <h1 className="text-[22px] font-extrabold tracking-normal text-[#252932]">
                Notifications
              </h1>
              <div className="ml-auto flex items-center gap-2">
                <button
                  className="flex size-9 items-center justify-center rounded-full text-[#7d8490] transition hover:bg-[#f4f6f8] hover:text-[#252932]"
                  aria-label="Expand notifications"
                >
                  <Expand className="size-4" />
                </button>
                <button
                  className="flex size-9 items-center justify-center rounded-full text-[#7d8490] transition hover:bg-[#f4f6f8] hover:text-[#252932]"
                  aria-label="Close notifications"
                >
                  <X className="size-4" />
                </button>
              </div>
            </header>

            <div className="flex items-center gap-3 border-b border-[#f1f2f4] px-5 py-4 sm:px-7">
              <button className="inline-flex items-center gap-2 text-[13px] font-bold text-[#7d8490] transition hover:text-[#252932]">
                <Filter className="size-4" />
                Filters
              </button>
              <button className="ml-auto inline-flex h-10 items-center gap-2 rounded-[6px] border border-[#e5e8ee] bg-white px-5 text-[12px] font-extrabold text-[#4b535f] shadow-[0_4px_14px_rgba(23,25,31,0.04)] transition hover:border-[#d6dbe3] hover:bg-[#f8f9fb]">
                <Check className="size-4" />
                Mark As Read
              </button>
            </div>

            <div className="max-h-[642px] overflow-y-auto">
              {notifications.map((item, index) => (
                <div key={`${item.name}-${index}`}>
                  {index === 3 ? (
                    <div className="flex items-center justify-center border-y border-[#f4f5f7] bg-white py-3 text-[11px] font-bold text-[#8f96a3]">
                      6 March 2023
                    </div>
                  ) : null}
                  <article className="group relative flex gap-3 px-5 py-4 transition hover:bg-[#fbfcfd] sm:px-7">
                    <div
                      className={`mt-1 flex size-10 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold ${item.tone}`}
                    >
                      {item.avatar}
                    </div>
                    <div className="min-w-0 flex-1 pr-6">
                      <p className="text-[13px] font-semibold leading-5 text-[#707783]">
                        <span className="font-extrabold text-[#252932]">
                          {item.name}
                        </span>{" "}
                        {item.action}{" "}
                        {item.ticket ? (
                          <span className="font-extrabold text-[#252932]">
                            {item.ticket}
                          </span>
                        ) : null}
                        {item.pill ? (
                          <span className="ml-1 inline-flex items-center gap-1 rounded-full border border-[#dfe3e9] bg-[#f7f8fa] px-2 py-0.5 text-[10px] font-extrabold text-[#4b535f]">
                            <CircleHelp className="size-3" />
                            {item.pill}
                          </span>
                        ) : null}
                      </p>
                      {item.preview ? (
                        <p className="mt-0.5 line-clamp-2 text-[12px] font-medium leading-5 text-[#3e4651]">
                          {item.preview}
                        </p>
                      ) : null}
                      <p className="mt-1 text-[10px] font-bold text-[#9aa1ac]">
                        {item.date} • {item.time}
                      </p>
                      {item.reply ? (
                        <button className="mt-1 text-[11px] font-extrabold text-[#737b87] transition hover:text-brand-red">
                          Reply
                        </button>
                      ) : null}
                    </div>
                    {item.unread ? (
                      <span className="absolute right-7 top-7 size-2.5 rounded-full bg-brand-red" />
                    ) : null}
                  </article>
                </div>
              ))}
            </div>
          </div>
        </section>
    
    </DashboardShell>
  );
}
