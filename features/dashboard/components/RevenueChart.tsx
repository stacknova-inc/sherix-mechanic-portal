export function RevenueChart() {
  return (
    <div className="relative h-[260px] w-full overflow-hidden">
      <div className="absolute left-0 top-4 grid h-[200px] w-full grid-rows-4 text-[11px] font-semibold text-[#8f96a3]">
        {["$8000", "$6000", "$4000", "$2000"].map((label) => (
          <div
            key={label}
            className="flex items-start gap-4 border-t border-dashed border-[#eef0f4]"
          >
            <span className="w-12 -translate-y-1.5">{label}</span>
          </div>
        ))}
      </div>
      <svg
        className="absolute bottom-8 left-12 right-2 top-3 h-[210px] w-[calc(100%-3.5rem)]"
        viewBox="0 0 640 260"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#e4072f" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#e4072f" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 168 C54 130 89 118 139 130 S235 150 278 112 S353 74 415 90 S492 105 540 54 S606 70 640 78 L640 260 L0 260 Z"
          fill="url(#revenueFill)"
        />
        <path
          d="M0 168 C54 130 89 118 139 130 S235 150 278 112 S353 74 415 90 S492 105 540 54 S606 70 640 78"
          fill="none"
          stroke="#e4072f"
          strokeLinecap="round"
          strokeWidth="4"
        />
      </svg>
      <div className="absolute bottom-1 left-12 right-2 flex justify-between text-[11px] font-semibold text-[#8f96a3]">
        {["01", "05", "10", "15", "20", "25", "30"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
    </div>
  );
}
