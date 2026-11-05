import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";

const role = vi.hoisted(() => ({ current: "admin" as "admin" | "staff" }));
const failNextSubmit = vi.hoisted(() => ({ current: false }));

vi.mock("@/store/auth-store", async (importOriginal) =>
  (await import("@/test/auth-store-mock")).createAuthStoreModule(await importOriginal()),
);
vi.mock("@/features/dashboard/layouts/DashboardShell", () => ({
  DashboardShell: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/hooks/use-user-role", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/hooks/use-user-role")>()),
  useUserRole: () => role.current,
}));
vi.mock("@/features/disputes/services/disputes-service", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/features/disputes/services/disputes-service")>();
  return {
    ...original,
    submitDisputeResponse: async (...args: Parameters<typeof original.submitDisputeResponse>) => {
      if (failNextSubmit.current) {
        failNextSubmit.current = false;
        args[2]?.(40);
        throw new Error("Network error while uploading.");
      }
      return original.submitDisputeResponse(...args);
    },
  };
});

import { sampleDisputes } from "@/features/disputes/mocks/disputes-sample";
import { DisputeDetailPage } from "@/features/disputes/DisputeDetailPage";

const openDispute = () => sampleDisputes.find((item) => item.status === "open")!;
const resolvedDispute = () => sampleDisputes.find((item) => item.status === "resolved")!;
const RESPONSE = "Our mechanic completed the brake pad replacement and the customer signed off.";

beforeAll(() => {
  URL.createObjectURL = vi.fn(() => "blob:preview");
  URL.revokeObjectURL = vi.fn();
});

beforeEach(() => {
  role.current = "admin";
  failNextSubmit.current = false;
});

describe("DisputeDetailPage", () => {
  it("shows the Service Request, parties, payment and payout state, timeline, and evidence", async () => {
    const dispute = openDispute();
    renderWithProviders(<DisputeDetailPage disputeId={dispute.id} />);

    expect(await screen.findByRole("heading", { name: `Dispute ${dispute.reference}` })).toBeInTheDocument();
    const parties = screen.getByRole("region", { name: "Service Request & parties" });
    expect(parties).toHaveTextContent(dispute.serviceRequest.reference);
    expect(parties).toHaveTextContent(dispute.customerName);
    expect(parties).toHaveTextContent(dispute.mechanic.name);
    expect(screen.getByRole("region", { name: "Payment & payout" })).toHaveTextContent("On hold");
    expect(screen.getByRole("region", { name: "Timeline" })).toHaveTextContent("Dispute opened by customer");
    expect(screen.getByRole("button", { name: `Download ${dispute.evidence[0].fileName}` })).toBeInTheDocument();
  });

  it("keeps resolved disputes read-only", async () => {
    const dispute = resolvedDispute();
    renderWithProviders(<DisputeDetailPage disputeId={dispute.id} />);

    const resolution = await screen.findByRole("region", { name: "Resolution" });
    expect(resolution).toHaveTextContent("resolved and read-only");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Submit response/ })).not.toBeInTheDocument();
  });

  it("hides the response form from staff", async () => {
    role.current = "staff";
    renderWithProviders(<DisputeDetailPage disputeId={openDispute().id} />);

    expect(await screen.findByText("Only company admins can respond to disputes.")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("shows not found for an unknown dispute", async () => {
    renderWithProviders(<DisputeDetailPage disputeId="dsp_missing" />);
    expect(await screen.findByText("Dispute not found")).toBeInTheDocument();
  });

  it("validates the response, previews and removes files, then submits with progress", async () => {
    const dispute = openDispute();
    renderWithProviders(<DisputeDetailPage disputeId={dispute.id} />);
    const message = await screen.findByLabelText("Your response");

    await userEvent.click(screen.getByRole("button", { name: /Submit response/ }));
    expect(screen.getByText(/Write a response/)).toBeInTheDocument();

    const upload = screen.getByLabelText(/choose files/);
    await userEvent.upload(upload, [
      new File(["a"], "job-photo.png", { type: "image/png" }),
      new File(["b"], "invoice.pdf", { type: "application/pdf" }),
    ]);
    const attached = screen.getByRole("list", { name: "Files ready to submit" });
    expect(within(attached).getAllByRole("listitem")).toHaveLength(2);

    await userEvent.click(screen.getByRole("button", { name: "Remove invoice.pdf" }));
    expect(within(attached).getAllByRole("listitem")).toHaveLength(1);

    await userEvent.type(message, RESPONSE);
    await userEvent.click(screen.getByRole("button", { name: /Submit response/ }));

    expect(await screen.findByText("Your response was submitted.")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("region", { name: "Your company's response" })).toHaveTextContent(RESPONSE));
    expect(screen.getByRole("button", { name: "Download job-photo.png" })).toBeInTheDocument();
    expect(screen.getAllByText("Under review").length).toBeGreaterThan(0);
  });

  it("keeps the draft after an upload failure and lets the user retry", async () => {
    failNextSubmit.current = true;
    const dispute = sampleDisputes.filter((item) => item.status !== "resolved")[1];
    renderWithProviders(<DisputeDetailPage disputeId={dispute.id} />);
    const message = await screen.findByLabelText(/Your response|Additional information/);

    await userEvent.type(message, RESPONSE);
    await userEvent.click(screen.getByRole("button", { name: /Submit response/ }));

    expect(await screen.findByText("Your response wasn't submitted.")).toBeInTheDocument();
    expect(message).toHaveValue(RESPONSE);

    await userEvent.click(screen.getByRole("button", { name: "Retry submission" }));
    expect(await screen.findByText("Your response was submitted.")).toBeInTheDocument();
  });
});
