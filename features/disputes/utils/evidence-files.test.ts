import { describe, expect, it } from "vitest";
import {
  EVIDENCE_RULES,
  addEvidenceFiles,
  validateEvidenceFile,
  validateResponseMessage,
} from "@/features/disputes/utils/evidence-files";

function file(name: string, type: string, size = 1024) {
  return new File([new Uint8Array(size)], name, { type, lastModified: 1 });
}

let counter = 0;
const nextId = () => `id-${(counter += 1)}`;

describe("validateEvidenceFile", () => {
  it("accepts supported images and PDFs within the size limit", () => {
    expect(validateEvidenceFile(file("photo.jpg", "image/jpeg"))).toBeNull();
    expect(validateEvidenceFile(file("invoice.PDF", "application/pdf"))).toBeNull();
  });

  it("rejects unsupported types, mismatched extensions, empty, and oversized files", () => {
    expect(validateEvidenceFile(file("script.html", "text/html"))).toMatch(/only JPG, PNG, WEBP, or PDF/);
    expect(validateEvidenceFile(file("fake.exe", "image/png"))).toMatch(/only JPG, PNG, WEBP, or PDF/);
    expect(validateEvidenceFile(file("empty.png", "image/png", 0))).toMatch(/empty/);
    expect(validateEvidenceFile(file("huge.png", "image/png", EVIDENCE_RULES.maxFileBytes + 1))).toMatch(/10\.0 MB or smaller/);
  });
});

describe("addEvidenceFiles", () => {
  it("adds valid files and reports every rejected one", () => {
    const result = addEvidenceFiles([], [file("a.png", "image/png"), file("b.txt", "text/plain")], nextId);

    expect(result.files.map((item) => item.file.name)).toEqual(["a.png"]);
    expect(result.errors).toEqual(["b.txt: only JPG, PNG, WEBP, or PDF files can be attached."]);
  });

  it("skips duplicates", () => {
    const first = addEvidenceFiles([], [file("a.png", "image/png")], nextId);
    const second = addEvidenceFiles(first.files, [file("a.png", "image/png")], nextId);

    expect(second.files).toHaveLength(1);
    expect(second.errors[0]).toMatch(/already attached/);
  });

  it("enforces the maximum number of files", () => {
    const picked = Array.from({ length: EVIDENCE_RULES.maxFiles + 2 }, (_, index) => file(`p${index}.png`, "image/png"));
    const result = addEvidenceFiles([], picked, nextId);

    expect(result.files).toHaveLength(EVIDENCE_RULES.maxFiles);
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0]).toMatch(/up to 5 files/);
  });
});

describe("validateResponseMessage", () => {
  it("requires a meaningful response within the length limits", () => {
    expect(validateResponseMessage("   ")).toMatch(/Write a response/);
    expect(validateResponseMessage("Too short")).toMatch(/at least 20/);
    expect(validateResponseMessage("x".repeat(2001))).toMatch(/under 2000/);
    expect(validateResponseMessage("The mechanic completed the work as agreed.")).toBeNull();
  });
});
