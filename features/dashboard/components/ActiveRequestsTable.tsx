import Link from "next/link";
import { StatusBadge } from "@/features/dashboard/components/StatusBadge";
import { getJobStatusClasses } from "@/features/dashboard/utils/dashboard-status";
import type { AdminRequest } from "@/features/requests/types";

interface ActiveRequestsTableProps {
  requests: AdminRequest[];
  isLoading?: boolean;
}

function mapRequestStatus(status: AdminRequest["status"]) {
  if (status === "Approved") {
    return "On Job";
  }

  if (status === "In Review") {
    return "En Route";
  }

  if (status === "Completed") {
    return "Finishing";
  }

  return "Pending";
}

export function ActiveRequestsTable({
  requests,
  isLoading = false,
}: ActiveRequestsTableProps) {
  const activeRequests = requests
    .filter((request) =>
      ["Pending", "In Review", "Approved"].includes(request.status),
    )
    .slice(0, 6);

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

      <div className="overflow-hidden rounded-lg border border-[#eef0f3] bg-white shadow-card dark:border-white/10 dark:bg-[#1b1d22]">
        <table className="w-full min-w-[700px] border-collapse text-left text-sm">
          <thead>
            <tr className="text-[11px] font-extrabold uppercase text-[#8a929e]">
              {["Customer", "Service", "Assigned Employee", "Time", "Status"].map(
                (heading) => (
                  <th key={heading} className="px-5 py-5">
                    {heading}
                  </th>
                ),
              )}
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
                  <p className="font-extrabold dark:text-white">{request.employeeName}</p>
                  <p className="text-xs text-[#8f96a3]">{request.department}</p>
                </td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-[#f4f5f7] px-3 py-1 text-xs font-extrabold text-[#687386]">
                    {request.requestType}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold dark:text-white/80">{request.assignedTo}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="dark:text-white/70">
                    {new Date(request.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                 
                </td>
                <td className="px-5 py-4">
                  <StatusBadge className={getJobStatusClasses(mapRequestStatus(request.status))}>
                    {request.status}
                  </StatusBadge>
                </td>
              </tr>
            ))
            ) : (
              <tr className="border-t border-[#f3f5f7] dark:border-white/10">
                <td
                  colSpan={5}
                  className="px-5 py-10 text-center text-sm font-semibold text-[#8f96a3]"
                >
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
