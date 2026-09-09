import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

type MobileShellProps = {
  children: ReactNode;
  withNav?: boolean;
};

/** Locks the experience to an Android phone canvas (390px). */
export function MobileShell({ children, withNav = true }: MobileShellProps) {
  return (
    <div className="flex min-h-screen justify-center bg-secondary">
      <div className="relative flex min-h-screen w-full max-w-[390px] flex-col bg-background shadow-card">
        <main className={withNav ? "flex-1 pb-24" : "flex-1"}>{children}</main>
        {withNav ? <BottomNav /> : null}
      </div>
    </div>
  );
}
