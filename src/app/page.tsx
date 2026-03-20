"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Fingerprint, Key, Mail, Shield } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="px-6 h-16 flex items-center justify-between border-b border-white/8 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-1.5 rounded-lg border border-primary/20">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold tracking-tight text-lg">MultiAuth</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-4xl space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Authentication Methods
            </h1>
            <p className="text-muted-foreground text-lg">
              Select a method to access the system
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              href="/auth/biometric"
              icon={<Fingerprint className="w-6 h-6" />}
              title="Biometric Auth"
              description="Login with TouchID or your device passkey for secure and easy access."
              badge="Secure"
            />
            <FeatureCard
              href="/auth/passwordless"
              icon={<Mail className="w-6 h-6" />}
              title="Magic Links"
              description="Fast, password-free login via a secure link sent to your email."
            />
            <FeatureCard
              href="/auth/password"
              icon={<Key className="w-6 h-6" />}
              title="Password"
              description="Standard credential authentication with email and password."
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-white/[0.08] bg-background py-8 px-6">
        <div className="max-w-4xl mx-auto flex justify-center items-center">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground">
              MultiAuth Assessment Project © 2026
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  href,
  icon,
  title,
  description,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="h-full bg-card/50 backdrop-blur-sm border-white/8 hover:bg-card/80 hover:border-white/15 transition-all duration-300 relative overflow-hidden">
        {badge && (
          <div className="absolute top-4 right-4 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border border-primary/20">
            {badge}
          </div>
        )}
        <CardContent className="p-6 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 border border-primary/20">
            {icon}
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
              {title}
              <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
