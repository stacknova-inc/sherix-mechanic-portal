import Link from "next/link";
import { StatusBadge } from "@/features/dashboard/components/StatusBadge";
import { activeJobs } from "@/features/dashboard/mocks/dashboard-mock-data";
import { getJobStatusClasses } from "@/features/dashboard/utils/dashboard-status";

export function ActiveRequestsTable() {
  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <h3 className="mr-auto text-2xl font-extrabold">Active Requests</h3>
        
        <Link
          href="/requests"
          className="flex h-9 items-center rounded-lg border border-[#eef0f3] px-5 text-xs font-extrabold text-[#6f7784] transition hover:border-brand-red hover:text-brand-red"
        >
          View All
        </Link>
        
      </div>

      <div className="overflow-hidden rounded-lg border border-[#eef0f3] bg-white shadow-card">
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
            {activeJobs.map((request) => (
              <tr key={request.id} className="border-t border-[#f3f5f7]">
                <td className="px-5 py-4">
                  <p className="font-extrabold">{request.employeeName}</p>
                  <p className="text-xs text-[#8f96a3]">{request.vehicle}</p>
                </td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-[#f4f5f7] px-3 py-1 text-xs font-extrabold text-[#687386]">
                    {request.service}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold">{request.mechanic}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p>{request.time}</p>
                 
                </td>
                <td className="px-5 py-4">
                  <StatusBadge className={getJobStatusClasses(request.status)}>
                    {request.status}
                  </StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
