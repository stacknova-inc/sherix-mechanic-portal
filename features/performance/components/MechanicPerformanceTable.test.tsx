import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MechanicPerformanceTable } from "@/features/performance/components/MechanicPerformanceTable";

const scope = { from: "2026-08-27", to: "2026-09-25", mechanic: "" };

describe("MechanicPerformanceTable", () => {
  it("labels every metric with its period", () => {
    render(
      <MechanicPerformanceTable
        rows={[]}
        scope={scope}
        periodLabel="Last 30 days"
      />,
    );

    const headers = screen.getAllByRole("columnheader").map((header) => header.textContent);
    expect(headers).toEqual([
      "Mechanic",
      "Assigned — Last 30 days",
      "Completed — Last 30 days",
      "Cancelled — Last 30 days",
      "Cancellation rate — Last 30 days",
    ]);
  });

  it("drills down from each count to the matching Service Requests", () => {
    render(
      <MechanicPerformanceTable
        rows={[
          {
            mechanicKey: "kofi",
            mechanicId: "kofi",
            mechanicName: "Kofi",
            assigned: 4,
            completed: 3,
            cancelled: 1,
            cancellationRate: 0.25,
          },
        ]}
        scope={scope}
        periodLabel="Last 30 days"
      />,
    );
    const table = screen.getByRole("table");

    expect(within(table).getByRole("link", { name: /completed Service Requests for Kofi/ })).toHaveAttribute(
      "href",
      "/requests?status=completed&mechanic=kofi&from=2026-08-27&to=2026-09-25",
    );
    expect(within(table).getByRole("link", { name: /cancelled Service Requests for Kofi/ })).toHaveAttribute(
      "href",
      "/requests?status=cancelled&mechanic=kofi&from=2026-08-27&to=2026-09-25",
    );
    expect(within(table).getByRole("link", { name: /Service Requests assigned to Kofi/ })).toHaveAttribute(
      "href",
      "/requests?mechanic=kofi&from=2026-08-27&to=2026-09-25",
    );
    expect(within(table).getByRole("link", { name: "Kofi" })).toHaveAttribute("href", "/employee/kofi");
    expect(within(table).getByText("25%")).toBeInTheDocument();
  });
});
