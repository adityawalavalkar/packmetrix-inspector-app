import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

type AppBarProps = {
  title: string;
  subtitle?: string;
  backTo?: "/dashboard" | "/scan" | "/history" | "/profile" | "/login";
  action?: ReactNode;
};

export function AppBar({ title, subtitle, backTo, action }: AppBarProps) {
  return (
    <header className="gov-gradient sticky top-0 z-30 px-4 pb-4 pt-5 text-primary-foreground">
      <div className="flex items-center gap-3">
        {backTo ? (
          <Link
            to={backTo}
            aria-label="Go back"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold leading-tight">{title}</h1>
          {subtitle ? (
            <p className="truncate text-[11px] uppercase tracking-wide text-primary-foreground/75">
              {subtitle}
            </p>
          ) : null}
        </div>
        {action}
      </div>
    </header>
  );
}
