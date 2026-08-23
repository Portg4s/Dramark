type SectionTitleProps = {
  title: string;
  action?: string;
};

export function SectionTitle({ title, action }: SectionTitleProps) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      {action ? <span className="text-sm font-medium text-muted">{action}</span> : null}
    </div>
  );
}
