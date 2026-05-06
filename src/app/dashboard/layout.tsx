"use client";

import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogOut, Shield, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card/30 backdrop-blur-xl fixed h-full z-30">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2 font-bold text-lg">
            <div className="bg-primary/10 p-1.5 rounded-lg border border-primary/20">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            MultiAuth
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem
            href="/dashboard"
            icon={<LayoutDashboard className="w-4 h-4" />}
            label="Overview"
            active={pathname === "/dashboard"}
          />
          <NavItem
            href="/dashboard/mfa"
            icon={<ShieldCheck className="w-4 h-4" />}
            label="Two-Factor Auth"
            active={pathname === "/dashboard/mfa"}
          />
        </nav>

        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            asChild
          >
            <Link href="/auth/logout">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Link>
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col md:ml-64">
        <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between">
          <div className="md:hidden">
            <Shield className="w-6 h-6 text-primary" />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              AD
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-primary/10 text-primary border border-primary/20"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
