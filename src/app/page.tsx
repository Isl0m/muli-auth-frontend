'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Authentication
          </h1>
          <p className="text-muted-foreground">
            Choose your preferred login method
          </p>
        </div>

        {/* Auth Methods List */}
        <div className="space-y-3 mb-8">
          <Link href="/auth/password" className="block">
            <Button variant="outline" className="w-full justify-start h-12 text-base font-normal bg-transparent">
              <span className="mr-3">🔐</span>
              Password & MFA
            </Button>
          </Link>

          <Link href="/auth/passwordless" className="block">
            <Button variant="outline" className="w-full justify-start h-12 text-base font-normal bg-transparent">
              <span className="mr-3">✉️</span>
              Magic Link
            </Button>
          </Link>

          <Link href="/auth/biometric" className="block">
            <Button variant="outline" className="w-full justify-start h-12 text-base font-normal bg-transparent">
              <span className="mr-3">👆</span>
              Biometric
            </Button>
          </Link>
        </div>

        {/* Footer Text */}
        <p className="text-xs text-center text-muted-foreground">
          All methods are encrypted and logged
        </p>
      </div>
    </main>
  );
}
