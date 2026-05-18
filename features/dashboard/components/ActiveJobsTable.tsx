import { StatusBadge } from "@/features/dashboard/components/StatusBadge";
import { activeJobs } from "@/features/dashboard/mocks/dashboard-mock-data";
import { getJobStatusClasses } from "@/features/dashboard/utils/dashboard-status";

export function ActiveJobsTable() {
  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <h3 className="mr-auto text-2xl font-extrabold">Active Employees</h3>
        <span className="rounded-full bg-brand-red px-3 py-1 text-xs font-extrabold text-white">
          12 LIVE
        </span>
        <button className="h-9 rounded-lg border border-[#eef0f3] px-5 text-xs font-extrabold text-[#6f7784]">
          Filter
        </button>
        <button className="h-9 rounded-lg bg-brand-red px-5 text-xs font-extrabold text-white">
          New Manual Request
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-[#eef0f3] bg-white shadow-card">
        <table className="w-full min-w-[700px] border-collapse text-left text-sm">
          <thead>
            <tr className="text-[11px] font-extrabold uppercase text-[#8a929e]">
              {["Employee", "Service", "Mechanic", "Time", "Status"].map((heading) => (
                <th key={heading} className="px-5 py-5">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeJobs.map((job) => (
              <tr key={job.id} className="border-t border-[#f3f5f7]">
                <td className="px-5 py-4">
                  <p className="font-extrabold">{job.employeeName}</p>
                  <p className="text-xs text-[#8f96a3]">{job.vehicle}</p>
                </td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-[#f4f5f7] px-3 py-1 text-xs font-extrabold text-[#687386]">
                    {job.service}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="size-6 rounded-full bg-[#edf0f3]" />
                    <span className="font-extrabold">{job.mechanic}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p>{job.time}</p>
                  <p className="text-xs font-extrabold text-brand-red">{job.eta}</p>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge className={getJobStatusClasses(job.status)}>
                    {job.status}
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
