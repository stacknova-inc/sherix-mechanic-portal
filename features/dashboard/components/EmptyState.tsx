interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-[#dfe3e9] bg-white p-8 text-center">
      <div>
        <p className="font-extrabold text-brand-dark">{title}</p>
        {description ? <p className="mt-2 text-sm text-[#6f7784]">{description}</p> : null}
      </div>
    </div>
  );
}
