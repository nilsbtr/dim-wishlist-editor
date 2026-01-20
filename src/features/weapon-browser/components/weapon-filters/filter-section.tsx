interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
}

export function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-muted-foreground text-[11px] font-semibold tracking-widest uppercase">
        {title}
      </h4>
      {children}
    </div>
  );
}
