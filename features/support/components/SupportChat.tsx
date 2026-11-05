"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AlertCircle, Loader2, Send } from "lucide-react";
import { LoadingSkeleton } from "@/features/dashboard/components/LoadingSkeleton";
import { QueryErrorState } from "@/features/dashboard/components/QueryErrorState";
import { SampleDataBadge } from "@/features/dashboard/components/SampleDataBadge";
import { SectionCard } from "@/features/dashboard/components/SectionCard";
import { useSupportConversation } from "@/features/support/hooks/useSupportConversation";
import type { SupportMessage } from "@/features/support/types";
import { formatDateTime } from "@/lib/date-format";
import { cn } from "@/utils/cn";

const MAX_MESSAGE_LENGTH = 2000;

function MessageBubble({
  message,
  children,
}: {
  message: Pick<SupportMessage, "author" | "authorName" | "sentAt"> & { body: string };
  children?: React.ReactNode;
}) {
  if (message.author === "system") {
    return (
      <li className="mx-auto max-w-md text-center text-xs font-semibold text-[#8f96a3]">
        {message.body}
      </li>
    );
  }

  const isOwn = message.author === "company";

  return (
    <li className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}>
      <p className="mb-1 text-[11px] font-extrabold text-[#8f96a3]">
        {message.authorName}
        {message.sentAt ? (
          <>
            {" · "}
            <time dateTime={message.sentAt}>{formatDateTime(message.sentAt)}</time>
          </>
        ) : null}
      </p>
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-line break-words rounded-2xl px-4 py-2.5 text-sm sm:max-w-[70%]",
          isOwn
            ? "rounded-br-md bg-brand-red text-white"
            : "rounded-bl-md bg-[#f4f5f7] text-brand-dark dark:bg-white/10 dark:text-white",
        )}
      >
        {message.body}
      </div>
      {children}
    </li>
  );
}

export function SupportChat() {
  const inputId = useId();
  const listRef = useRef<HTMLOListElement>(null);
  const [draft, setDraft] = useState("");
  const { data: conversation, isLoading, isError, error, refetch, pending, send, retry, discard } =
    useSupportConversation();

  const confirmedIds = new Set(conversation?.messages.map((message) => message.id));
  // A poll can return a message before its send call resolves; don't show it twice.
  const visiblePending = pending.filter((message) => !confirmedIds.has(message.tempId));
  const messageCount = (conversation?.messages.length ?? 0) + visiblePending.length;
  const isClosed = conversation?.status === "closed";
  const trimmed = draft.trim();
  const tooLong = trimmed.length > MAX_MESSAGE_LENGTH;

  useEffect(() => {
    const list = listRef.current;
    if (list) {
      list.scrollTop = list.scrollHeight;
    }
  }, [messageCount]);

  function handleSend() {
    if (!trimmed || tooLong || isClosed) {
      return;
    }
    send(trimmed);
    setDraft("");
  }

  return (
    <SectionCard
      title="Chat with support"
      description={
        conversation
          ? `${conversation.subject} · ${conversation.agent ? `With ${conversation.agent.name}` : "Waiting for an agent"}`
          : "Start a conversation with the Sherix support team."
      }
      badge={<SampleDataBadge />}
      flush
    >
      {isLoading ? (
        <LoadingSkeleton label="Loading conversation…" rows={4} rowClassName="h-14" className="p-5" />
      ) : isError || !conversation ? (
        <div className="p-5">
          <QueryErrorState error={error} subject="your support conversation" onRetry={() => void refetch()} />
        </div>
      ) : (
        <>
          <ol
            ref={listRef}
            role="log"
            aria-live="polite"
            aria-label="Support conversation"
            tabIndex={0}
            className="h-[420px] space-y-4 overflow-y-auto p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-red"
          >
            {conversation.messages.length === 0 && visiblePending.length === 0 ? (
              <li className="py-16 text-center text-sm text-[#8f96a3]">
                No messages yet. Describe your issue below and a support agent will reply here.
              </li>
            ) : null}
            {conversation.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {visiblePending.map((message) => (
              <MessageBubble
                key={message.tempId}
                message={{ author: "company", authorName: "You", body: message.body, sentAt: "" }}
              >
                {message.status === "sending" ? (
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#8f96a3]">
                    <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                    Sending…
                  </p>
                ) : (
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-extrabold text-brand-red">
                    <AlertCircle className="size-3" aria-hidden="true" />
                    Not sent.
                    <button type="button" onClick={() => retry(message.tempId)} className="rounded underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red">
                      Retry
                    </button>
                    <button type="button" onClick={() => discard(message.tempId)} className="rounded text-[#6f7784] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red">
                      Discard
                    </button>
                  </p>
                )}
              </MessageBubble>
            ))}
          </ol>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSend();
            }}
            className="border-t border-[#f0f2f5] p-4 dark:border-white/10"
          >
            <label htmlFor={inputId} className="sr-only">Message to support</label>
            <div className="flex items-end gap-2">
              <textarea
                id={inputId}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                rows={2}
                disabled={isClosed}
                aria-describedby={`${inputId}-hint`}
                placeholder={isClosed ? "This conversation is closed." : "Type your message…"}
                className="min-h-[44px] flex-1 resize-none rounded-xl border border-[#eef0f3] bg-white px-3 py-2.5 text-sm text-brand-dark outline-none transition focus:border-brand-red focus:ring-4 focus:ring-red-50 disabled:opacity-60 dark:border-white/10 dark:bg-[#1b1d22] dark:text-white dark:focus:ring-red-950/30"
              />
              <button
                type="submit"
                disabled={!trimmed || tooLong || isClosed}
                aria-label="Send message"
                className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-red text-white transition hover:bg-[#c90629] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="size-4" aria-hidden="true" />
              </button>
            </div>
            <p id={`${inputId}-hint`} className={cn("mt-1.5 text-[11px]", tooLong ? "font-bold text-brand-red" : "text-[#8f96a3]")}>
              {tooLong
                ? `Messages can be up to ${MAX_MESSAGE_LENGTH} characters.`
                : "Press Enter to send, Shift + Enter for a new line."}
            </p>
          </form>
        </>
      )}
    </SectionCard>
  );
}
