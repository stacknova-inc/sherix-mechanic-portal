interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-[#dfe3e9] bg-white p-8 text-center dark:border-white/10 dark:bg-[#1b1d22]">
      <div>
        <p className="font-extrabold text-brand-dark dark:text-white">{title}</p>
        {description ? <p className="mt-2 text-sm text-[#6f7784] dark:text-white/55">{description}</p> : null}
      </div>
    </div>
  );
}
