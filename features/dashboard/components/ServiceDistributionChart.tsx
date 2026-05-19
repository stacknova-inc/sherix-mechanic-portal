import { serviceDistribution } from "@/features/dashboard/mocks/dashboard-mock-data";

export function ServiceDistributionChart() {
  return (
    <div className="flex flex-col items-center">
      <div className="relative my-6 size-[180px] rounded-full bg-[conic-gradient(#e4072f_0_35%,#ffffff_35%_38%,#f4a51c_38%_58%,#ffffff_58%_61%,#119b6f_61%_81%,#ffffff_81%_84%,#3c91f7_84%_100%)]">
        <div className="absolute inset-[32px] rounded-full bg-white" />
      </div>
      <div className="w-full space-y-2.5">
        {serviceDistribution.map((segment) => (
          <div
            key={segment.label}
            className="flex items-center text-[11px] font-semibold text-[#687386]"
          >
            <span className={`mr-2 size-2.5 rounded-full ${segment.colorClassName}`} />
            <span>{segment.label}</span>
            <span className="ml-auto font-extrabold text-brand-dark">
              {segment.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
