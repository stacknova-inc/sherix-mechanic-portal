"use client";

import { useId, useState } from "react";
import { Loader2, RotateCw, Send } from "lucide-react";
import { primaryButtonClassName } from "@/features/dashboard/components/form-styles";
import { EvidenceFilePicker } from "@/features/disputes/components/EvidenceFilePicker";
import { useSubmitDisputeResponse } from "@/features/disputes/hooks/useDisputes";
import {
  RESPONSE_MAX_LENGTH,
  validateResponseMessage,
  type PendingEvidenceFile,
} from "@/features/disputes/utils/evidence-files";
import { getApiErrorMessage } from "@/services/api-error";
import { cn } from "@/utils/cn";

interface DisputeResponseFormProps {
  disputeId: string;
  /** True when the company already responded and is adding more information. */
  isFollowUp: boolean;
}

export function DisputeResponseForm({ disputeId, isFollowUp }: DisputeResponseFormProps) {
  const messageId = useId();
  const errorId = useId();
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<PendingEvidenceFile[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const submit = useSubmitDisputeResponse(disputeId);
  const messageError = validateResponseMessage(message);
  const visibleError = showErrors ? messageError : null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setShowErrors(true);

    // Ignore repeat submissions while one is in flight.
    if (messageError || submit.isPending) {
      return;
    }

    submit.mutate(
      { message, files: files.map((item) => item.file) },
      {
        onSuccess: () => {
          setMessage("");
          setFiles([]);
          setShowErrors(false);
        },
      },
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor={messageId} className="text-sm font-extrabold text-brand-dark dark:text-white">
          {isFollowUp ? "Additional information" : "Your response"}
        </label>
        <p className="mt-0.5 text-xs text-[#8f96a3]">
          Explain what happened from your company&apos;s side. Sherix and the customer will see this.
        </p>
        <textarea
          id={messageId}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          maxLength={RESPONSE_MAX_LENGTH + 200}
          disabled={submit.isPending}
          aria-invalid={Boolean(visibleError)}
          aria-describedby={visibleError ? errorId : `${messageId}-count`}
          className={cn(
            "mt-2 w-full rounded-xl border border-[#eef0f3] bg-white px-3 py-2.5 text-sm text-brand-dark outline-none transition focus:border-brand-red focus:ring-4 focus:ring-red-50 disabled:opacity-60 dark:border-white/10 dark:bg-[#1b1d22] dark:text-white dark:focus:ring-red-950/30",
            visibleError && "border-brand-red",
          )}
        />
        <div className="mt-1 flex justify-between gap-3 text-xs">
          {visibleError ? (
            <p id={errorId} className="font-bold text-brand-red">{visibleError}</p>
          ) : (
            <span />
          )}
          <p
            id={`${messageId}-count`}
            className={cn("shrink-0 font-semibold", message.trim().length > RESPONSE_MAX_LENGTH ? "text-brand-red" : "text-[#8f96a3]")}
          >
            {message.trim().length} / {RESPONSE_MAX_LENGTH}
          </p>
        </div>
      </div>

      <EvidenceFilePicker files={files} onChange={setFiles} disabled={submit.isPending} />

      {submit.isPending ? (
        <div>
          <div className="flex justify-between text-xs font-extrabold text-[#596170] dark:text-white/65">
            <span>
              {files.length
                ? `Uploading ${files.length} file${files.length === 1 ? "" : "s"} and response…`
                : "Submitting response…"}
            </span>
            <span>{submit.progress}%</span>
          </div>
          <div
            role="progressbar"
            aria-label="Submission progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={submit.progress}
            className="mt-2 h-2 overflow-hidden rounded-full bg-[#eef0f3] dark:bg-white/10"
          >
            <div className="h-full bg-brand-red transition-[width]" style={{ width: `${submit.progress}%` }} />
          </div>
        </div>
      ) : null}

      {submit.isError ? (
        <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-brand-red dark:bg-red-500/10">
          <p className="font-extrabold">Your response wasn&apos;t submitted.</p>
          <p className="mt-0.5">{getApiErrorMessage(submit.error)} Your text and files are kept, so you can try again.</p>
        </div>
      ) : null}

      <div className="flex justify-end">
        <button type="submit" disabled={submit.isPending} className={primaryButtonClassName}>
          {submit.isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : submit.isError ? (
            <RotateCw className="size-4" aria-hidden="true" />
          ) : (
            <Send className="size-4" aria-hidden="true" />
          )}
          {submit.isPending ? "Submitting…" : submit.isError ? "Retry submission" : "Submit response"}
        </button>
      </div>
    </form>
  );
}
