/**
 * Sample evidence rules. The backend must define and enforce the real limits;
 * these are placeholders for review (see FRONTEND_NOTES.md).
 */
export const EVIDENCE_RULES = {
  acceptedMimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const,
  acceptedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".pdf"] as const,
  maxFileBytes: 10 * 1024 * 1024,
  maxFiles: 5,
};

export const RESPONSE_MIN_LENGTH = 20;
export const RESPONSE_MAX_LENGTH = 2000;

export interface PendingEvidenceFile {
  id: string;
  file: File;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isImageType(mimeType: string) {
  return mimeType.startsWith("image/");
}

function hasAcceptedExtension(name: string) {
  const lower = name.toLowerCase();
  return EVIDENCE_RULES.acceptedExtensions.some((extension) => lower.endsWith(extension));
}

/** Returns why a file is rejected, or null when it is acceptable. */
export function validateEvidenceFile(file: File): string | null {
  const typeAccepted = (EVIDENCE_RULES.acceptedMimeTypes as readonly string[]).includes(file.type);

  if (!typeAccepted || !hasAcceptedExtension(file.name)) {
    return `${file.name}: only JPG, PNG, WEBP, or PDF files can be attached.`;
  }

  if (file.size === 0) {
    return `${file.name}: the file is empty.`;
  }

  if (file.size > EVIDENCE_RULES.maxFileBytes) {
    return `${file.name}: files must be ${formatBytes(EVIDENCE_RULES.maxFileBytes)} or smaller.`;
  }

  return null;
}

/**
 * Adds newly picked files to the pending list, skipping invalid files,
 * duplicates (same name, size, and modified time), and anything over the limit.
 */
export function addEvidenceFiles(
  current: PendingEvidenceFile[],
  picked: File[],
  createId: () => string,
): { files: PendingEvidenceFile[]; errors: string[] } {
  const errors: string[] = [];
  const files = [...current];

  picked.forEach((file) => {
    const problem = validateEvidenceFile(file);
    if (problem) {
      errors.push(problem);
      return;
    }

    const duplicate = files.some(
      (item) =>
        item.file.name === file.name && item.file.size === file.size && item.file.lastModified === file.lastModified,
    );
    if (duplicate) {
      errors.push(`${file.name}: already attached.`);
      return;
    }

    if (files.length >= EVIDENCE_RULES.maxFiles) {
      errors.push(`${file.name}: you can attach up to ${EVIDENCE_RULES.maxFiles} files.`);
      return;
    }

    files.push({ id: createId(), file });
  });

  return { files, errors };
}

export function validateResponseMessage(message: string): string | null {
  const length = message.trim().length;

  if (length === 0) {
    return "Write a response describing your side of the dispute.";
  }

  if (length < RESPONSE_MIN_LENGTH) {
    return `Add a little more detail (at least ${RESPONSE_MIN_LENGTH} characters).`;
  }

  if (length > RESPONSE_MAX_LENGTH) {
    return `Keep your response under ${RESPONSE_MAX_LENGTH} characters.`;
  }

  return null;
}
