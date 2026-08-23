type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="mb-6 pt-2">
      {eyebrow ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand">{eyebrow}</p>
      ) : null}
      <h1 className="text-balance text-3xl font-black leading-tight text-white sm:text-5xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 max-w-2xl text-pretty text-base leading-7 text-muted">{description}</p>
      ) : null}
    </header>
  );
}
