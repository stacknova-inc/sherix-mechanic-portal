"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FileText, Paperclip, X } from "lucide-react";
import {
  EVIDENCE_RULES,
  addEvidenceFiles,
  formatBytes,
  isImageType,
  type PendingEvidenceFile,
} from "@/features/disputes/utils/evidence-files";
import { cn } from "@/utils/cn";

interface EvidenceFilePickerProps {
  files: PendingEvidenceFile[];
  onChange: (files: PendingEvidenceFile[]) => void;
  disabled?: boolean;
}

let pendingFileCounter = 0;
const nextId = () => `evidence-${(pendingFileCounter += 1)}`;

/** Local preview only. Uses a revocable object URL; nothing is uploaded until the form is submitted. */
function ImagePreview({ file }: { file: File }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return url ? (
    // eslint-disable-next-line @next/next/no-img-element -- local blob preview; next/image cannot optimise it
    <img src={url} alt="" className="size-full object-cover" />
  ) : null;
}

export function EvidenceFilePicker({ files, onChange, disabled = false }: EvidenceFilePickerProps) {
  const inputId = useId();
  const helpId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const atLimit = files.length >= EVIDENCE_RULES.maxFiles;

  function handlePicked(picked: FileList | null) {
    if (!picked?.length) {
      return;
    }

    const result = addEvidenceFiles(files, Array.from(picked), nextId);
    setErrors(result.errors);
    onChange(result.files);

    // Allow picking the same file again after removing it.
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div>
      <p className="text-sm font-extrabold text-brand-dark dark:text-white">Evidence (optional)</p>
      <p id={helpId} className="mt-0.5 text-xs text-[#8f96a3]">
        Photos or PDFs such as Service Request photos, invoices, or signed completion forms. Up to {EVIDENCE_RULES.maxFiles} files,{" "}
        {formatBytes(EVIDENCE_RULES.maxFileBytes)} each. JPG, PNG, WEBP, or PDF.
      </p>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled && !atLimit) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (!disabled && !atLimit) handlePicked(event.dataTransfer.files);
        }}
        className={cn(
          "mt-3 flex flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition",
          isDragging ? "border-brand-red bg-red-50/60 dark:bg-brand-red/10" : "border-[#dfe3e9] dark:border-white/10",
          (disabled || atLimit) && "opacity-60",
        )}
      >
        <Paperclip className="size-5 text-[#8f96a3]" aria-hidden="true" />
        <p className="text-sm text-[#596170] dark:text-white/65">
          Drag files here, or{" "}
          <label
            htmlFor={inputId}
            className={cn(
              "rounded font-extrabold text-brand-red underline-offset-4 focus-within:ring-2 focus-within:ring-brand-red",
              disabled || atLimit ? "cursor-not-allowed" : "cursor-pointer hover:underline",
            )}
          >
            choose files
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              multiple
              accept={[...EVIDENCE_RULES.acceptedMimeTypes, ...EVIDENCE_RULES.acceptedExtensions].join(",")}
              disabled={disabled || atLimit}
              aria-describedby={helpId}
              onChange={(event) => handlePicked(event.target.files)}
              className="sr-only"
            />
          </label>
        </p>
        <p className="text-xs text-[#8f96a3]" aria-live="polite">
          {files.length} of {EVIDENCE_RULES.maxFiles} files attached
        </p>
      </div>

      {errors.length ? (
        <ul role="alert" className="mt-3 space-y-1 text-xs font-bold text-brand-red">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}

      {files.length ? (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2" aria-label="Files ready to submit">
          {files.map(({ id, file }) => (
            <li key={id} className="flex items-center gap-3 rounded-xl border border-[#eef0f3] p-2 dark:border-white/10">
              <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f4f5f7] dark:bg-white/10">
                {isImageType(file.type) ? (
                  <ImagePreview file={file} />
                ) : (
                  <FileText className="size-6 text-[#8f96a3]" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-brand-dark dark:text-white" title={file.name}>{file.name}</p>
                <p className="text-xs text-[#8f96a3]">{formatBytes(file.size)}</p>
              </div>
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  onChange(files.filter((item) => item.id !== id));
                  setErrors([]);
                }}
                aria-label={`Remove ${file.name}`}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#6f7784] transition hover:bg-[#f7f8fa] hover:text-brand-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red disabled:opacity-50 dark:hover:bg-white/10"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
