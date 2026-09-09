import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, IdCard, KeyRound, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/packmetrix-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Officer Sign In — PackMetrix AI" },
      {
        name: "description",
        content: "Secure sign in for Legal Metrology inspectors using their official officer ID.",
      },
      { property: "og:title", content: "Officer Sign In — PackMetrix AI" },
      {
        property: "og:description",
        content: "Secure sign in for Legal Metrology inspectors using their official officer ID.",
      },
    ],
  }),
  component: LoginScreen,
});

function LoginScreen() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen justify-center bg-secondary">
      <div className="flex min-h-screen w-full max-w-[390px] flex-col bg-background">
        <div className="gov-gradient rounded-b-[2rem] px-6 pb-10 pt-12 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/15">
              <img src={logo} alt="PackMetrix AI emblem" width={512} height={512} className="h-9 w-9" />
            </div>
            <div>
              <h1 className="text-xl font-semibold leading-tight">PackMetrix AI</h1>
              <p className="text-[11px] text-primary-foreground/80">
                Ministry of Consumer Affairs, Govt. of India
              </p>
            </div>
          </div>
          <p className="mt-6 text-sm text-primary-foreground/85">
            Sign in with your Legal Metrology officer credentials to begin field inspections.
          </p>
        </div>

        <form
          className="fade-up flex flex-1 flex-col gap-5 px-6 pb-10 pt-8"
          onSubmit={(event) => {
            event.preventDefault();
            navigate({ to: "/dashboard" });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="officerId" className="text-xs font-medium text-muted-foreground">
              Officer ID
            </Label>
            <div className="relative">
              <IdCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="officerId"
                defaultValue="LM-DEL-2291"
                autoComplete="username"
                className="h-12 rounded-2xl pl-10"
                placeholder="LM-XXX-0000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">
              Password
            </Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                defaultValue="inspector"
                autoComplete="current-password"
                className="h-12 rounded-2xl pl-10 pr-11"
                placeholder="••••••••"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button type="button" className="self-end text-xs font-medium text-primary">
            Forgot password?
          </button>

          <Button type="submit" size="lg" className="h-13 rounded-2xl py-4 text-base font-semibold shadow-elevated">
            Sign In
          </Button>

          <div className="card-surface flex items-start gap-3 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Authorised use only. All inspection activity is logged under the Legal Metrology Act, 2009.
            </p>
          </div>

          <p className="mt-auto pt-6 text-center text-[11px] text-muted-foreground">
            Ministry of Consumer Affairs, Food &amp; Public Distribution
          </p>
        </form>
      </div>
    </div>
  );
}
