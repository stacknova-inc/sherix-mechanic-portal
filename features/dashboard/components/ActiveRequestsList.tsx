import { Wrench } from "lucide-react";
import { activeRequests } from "@/features/dashboard/mocks/dashboard-mock-data";

export function ActiveRequestsList() {
  return (
    <section>
      <h3 className="mb-5 text-xl font-extrabold">Active Requests</h3>
      <div className="space-y-3">
        {activeRequests.map((request) => (
          <article
            key={request.id}
            className="flex items-center rounded-lg border border-[#eef0f3] bg-white p-4 shadow-card"
          >
            <div className="relative mr-4 flex size-11 items-center justify-center rounded-full bg-[#edf0f3]">
              <Wrench className="size-5 text-white" />
              <span
                className={`absolute bottom-0 right-0 size-3 rounded-full ${request.indicatorClassName}`}
              />
            </div>
            <div>
              <p className="font-extrabold">{request.mechanicName}</p>
              <p className="text-xs text-[#8f96a3]">{request.area}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs font-extrabold text-brand-red">{request.status}</p>
              <p className="text-xs font-extrabold">{request.vehicle}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
