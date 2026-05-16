import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";

// Page chrome shared by every console screen — a breadcrumb trail, an object
// icon, a title, a plain-language description, and a slot for primary actions.

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ trail }: { trail: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground"
    >
      {trail.map((crumb, i) => {
        const last = i === trail.length - 1;
        return (
          <span key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
            {crumb.href && !last ? (
              <Link
                href={crumb.href}
                className="transition-colors hover:text-foreground"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className={last ? "font-medium text-foreground" : undefined}>
                {crumb.label}
              </span>
            )}
            {!last && <ChevronRight className="h-3 w-3 text-border" />}
          </span>
        );
      })}
    </nav>
  );
}

export default function PageHeader({
  icon: Icon,
  title,
  description,
  breadcrumb,
  actions,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  breadcrumb?: Crumb[];
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-7">
      {breadcrumb && <Breadcrumb trail={breadcrumb} />}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-card text-primary">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {description && (
              <p className="mt-0.5 max-w-2xl text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}
