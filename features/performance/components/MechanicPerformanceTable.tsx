import Link from "next/link";
import {
  CANCELLED_STATUS,
  COMPLETED_STATUS,
} from "@/features/requests/utils/service-request-status";
import {
  buildPerformanceDrillDownHref,
  formatRate,
  type MechanicPerformanceRow,
  type PerformanceScope,
} from "@/features/performance/utils/mechanic-performance";

interface MechanicPerformanceTableProps {
  rows: MechanicPerformanceRow[];
  scope: PerformanceScope;
  periodLabel: string;
}

const linkClassName =
  "rounded font-extrabold text-brand-dark underline-offset-4 hover:text-brand-red hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red dark:text-white";

function CountLink({
  count,
  href,
  description,
}: {
  count: number;
  href: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      aria-label={`${count.toLocaleString()} ${description}`}
      className={linkClassName}
    >
      {count.toLocaleString()}
    </Link>
  );
}

function getRowCells(row: MechanicPerformanceRow, scope: PerformanceScope) {
  const name = row.mechanicName;

  return {
    assigned: (
      <CountLink
        count={row.assigned}
        href={buildPerformanceDrillDownHref(scope, undefined, row.mechanicKey)}
        description={`Service Requests assigned to ${name}`}
      />
    ),
    completed: (
      <CountLink
        count={row.completed}
        href={buildPerformanceDrillDownHref(scope, COMPLETED_STATUS, row.mechanicKey)}
        description={`completed Service Requests for ${name}`}
      />
    ),
    cancelled: (
      <CountLink
        count={row.cancelled}
        href={buildPerformanceDrillDownHref(scope, CANCELLED_STATUS, row.mechanicKey)}
        description={`cancelled Service Requests for ${name}`}
      />
    ),
    rate: formatRate(row.cancellationRate),
  };
}

export function MechanicPerformanceTable({ rows, scope, periodLabel }: MechanicPerformanceTableProps) {
  const headings = [
    "Mechanic",
    `Assigned — ${periodLabel}`,
    `Completed — ${periodLabel}`,
    `Cancelled — ${periodLabel}`,
    `Cancellation rate — ${periodLabel}`,
  ];

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">Mechanic performance, {periodLabel}</caption>
          <thead>
            <tr className="text-[11px] font-extrabold uppercase text-[#8a929e]">
              {headings.map((heading) => (
                <th key={heading} scope="col" className="px-5 py-4">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const cells = getRowCells(row, scope);

              return (
                <tr key={row.mechanicKey} className="border-t border-[#f3f5f7] dark:border-white/10">
                  <th scope="row" className="px-5 py-4 font-extrabold text-[#343a45] dark:text-white/85">
                    {row.mechanicId ? (
                      <Link href={`/employee/${encodeURIComponent(row.mechanicId)}`} className={linkClassName}>
                        {row.mechanicName}
                      </Link>
                    ) : (
                      row.mechanicName
                    )}
                  </th>
                  <td className="px-5 py-4">{cells.assigned}</td>
                  <td className="px-5 py-4">{cells.completed}</td>
                  <td className="px-5 py-4">{cells.cancelled}</td>
                  <td className="px-5 py-4 font-semibold text-[#343a45] dark:text-white/80">{cells.rate}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 p-4 md:hidden">
        {rows.map((row) => {
          const cells = getRowCells(row, scope);

          return (
            <li
              key={row.mechanicKey}
              className="rounded-xl border border-[#eef0f3] p-4 dark:border-white/10"
            >
              <p className="font-extrabold text-brand-dark dark:text-white">{row.mechanicName}</p>
              <p className="text-[11px] font-semibold text-[#8f96a3]">{periodLabel}</p>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                {[
                  ["Assigned", cells.assigned],
                  ["Completed", cells.completed],
                  ["Cancelled", cells.cancelled],
                  ["Cancellation rate", cells.rate],
                ].map(([term, value]) => (
                  <div key={String(term)}>
                    <dt className="font-extrabold text-[#8f96a3]">{term}</dt>
                    <dd className="mt-1 text-sm">{value}</dd>
                  </div>
                ))}
              </dl>
            </li>
          );
        })}
      </ul>
    </>
  );
}
