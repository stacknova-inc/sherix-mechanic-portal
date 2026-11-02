import Link from "next/link";
import { StatusBadge } from "@/features/requests/components/StatusBadge";
import type { CompanyServiceRequest } from "@/features/requests/types";
import {
  getMechanicLabel,
  getServiceRequestHref,
} from "@/features/requests/utils/service-request-filters";
import { isOpenServiceRequest } from "@/features/requests/utils/service-request-status";
import { formatDate } from "@/lib/date-format";

interface ActiveRequestsTableProps {
  requests: CompanyServiceRequest[];
  isLoading?: boolean;
}

const MAX_ROWS = 6;

export function ActiveRequestsTable({ requests, isLoading = false }: ActiveRequestsTableProps) {
  const activeRequests = requests.filter((request) => isOpenServiceRequest(request.status)).slice(0, MAX_ROWS);

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <h3 className="mr-auto text-2xl font-extrabold dark:text-white">Active Requests</h3>
        <Link
          href="/requests"
          className="flex h-9 items-center rounded-lg border border-[#eef0f3] px-5 text-xs font-extrabold text-[#6f7784] transition hover:border-brand-red hover:text-brand-red dark:border-white/10 dark:text-white/60"
        >
          View All
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#eef0f3] bg-white shadow-card dark:border-white/10 dark:bg-[#1b1d22]">
        <table className="w-full min-w-[700px] border-collapse text-left text-sm">
          <caption className="sr-only">Active Service Requests</caption>
          <thead>
            <tr className="text-[11px] font-extrabold uppercase text-[#8a929e]">
              {["Customer", "Service", "Assigned Mechanic", "Date", "Status"].map((heading) => (
                <th key={heading} scope="col" className="px-5 py-5">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={index} className="border-t border-[#f3f5f7] dark:border-white/10">
                  {Array.from({ length: 5 }).map((__, cellIndex) => (
                    <td key={cellIndex} className="px-5 py-4">
                      <div className="h-4 animate-pulse rounded bg-gray-100 dark:bg-white/10" />
                    </td>
                  ))}
                </tr>
              ))
            ) : activeRequests.length ? (
              activeRequests.map((request) => (
                <tr key={request.id} className="border-t border-[#f3f5f7] dark:border-white/10">
                  <td className="px-5 py-4">
                    <Link
                      href={getServiceRequestHref(request)}
                      className="rounded font-extrabold underline-offset-4 hover:text-brand-red hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red dark:text-white"
                    >
                      {request.customerName ?? request.reference}
                    </Link>
                    <p className="text-xs text-[#8f96a3]">{request.location ?? request.reference}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-[#f4f5f7] px-3 py-1 text-xs font-extrabold text-[#687386]">
                      {request.serviceName ?? "Not available"}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-extrabold dark:text-white/80">{getMechanicLabel(request)}</td>
                  <td className="px-5 py-4 dark:text-white/70">{formatDate(request.date)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={request.status} />
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-t border-[#f3f5f7] dark:border-white/10">
                <td colSpan={5} className="px-5 py-10 text-center text-sm font-semibold text-[#8f96a3]">
                  No active requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
