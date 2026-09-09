import { Link } from "@tanstack/react-router";
import { LayoutDashboard, ScanLine, History, UserRound } from "lucide-react";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/scan", label: "Scan", icon: ScanLine },
  { to: "/history", label: "History", icon: History },
  { to: "/profile", label: "Profile", icon: UserRound },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[390px] -translate-x-1/2 border-t border-border bg-card/95 backdrop-blur">
      <ul className="flex items-stretch justify-between px-2 pb-2 pt-1.5">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              className="group flex flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-muted-foreground transition-colors data-[status=active]:text-primary"
              activeProps={{ "aria-current": "page" }}
            >
              <span className="flex h-8 w-16 items-center justify-center rounded-full transition-colors group-data-[status=active]:bg-primary-soft">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <span className="text-[11px] font-medium leading-none">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
