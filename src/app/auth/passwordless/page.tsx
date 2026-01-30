'use client';

import React from "react"

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InputOTP } from '@/components/ui/input-otp';
import { REGEXP_ONLY_DIGITS } from 'input-otp';

type AuthStep = 'email-entry' | 'code-entry' | 'success';

export default function PasswordlessAuthPage() {
  const [step, setStep] = useState<AuthStep>('email-entry');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeMethod, setCodeMethod] = useState<'magic-link' | 'email-code'>('magic-link');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // API call would go here
      console.log('[v0] Passwordless request:', { email, codeMethod });
      setSuccess(`${codeMethod === 'magic-link' ? 'Magic link' : 'Verification code'} sent to ${email}`);
      setStep('code-entry');
    } catch (err) {
      setError('Failed to send code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // API call would go here
      console.log('[v0] Code verification:', { email, code });
      setStep('success');
    } catch (err) {
      setError('Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      console.log('[v0] Resend code request:', { email });
      setSuccess(`New ${codeMethod === 'magic-link' ? 'magic link' : 'verification code'} sent to ${email}`);
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="absolute top-8 left-8">
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            ← Back
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-md">
        <Card className="p-8 border-border">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {step === 'email-entry' && 'Passwordless Login'}
              {step === 'code-entry' && 'Verify Code'}
              {step === 'success' && 'Welcome Back!'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {step === 'email-entry' && 'Enter your email to receive a secure login link or code'}
              {step === 'code-entry' && `Check your email for the verification ${codeMethod === 'magic-link' ? 'link' : 'code'}`}
              {step === 'success' && 'You have been successfully authenticated'}
            </p>
          </div>

          {/* Success Alert */}
          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert className="mb-6 border-destructive/50 bg-destructive/10">
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          )}

          {/* Email Entry Step */}
          {step === 'email-entry' && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-card"
                  autoFocus
                />
              </div>

              <div className="space-y-3">
                <Label>Delivery Method</Label>
                <div className="space-y-2">
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      codeMethod === 'magic-link'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setCodeMethod('magic-link')}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-4 h-4 mt-1">
                        <input
                          type="radio"
                          name="method"
                          value="magic-link"
                          checked={codeMethod === 'magic-link'}
                          onChange={(e) => setCodeMethod(e.target.value as 'magic-link')}
                          className="w-4 h-4"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Magic Link</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Click a link in your email to instantly sign in
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      codeMethod === 'email-code'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setCodeMethod('email-code')}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-4 h-4 mt-1">
                        <input
                          type="radio"
                          name="method"
                          value="email-code"
                          checked={codeMethod === 'email-code'}
                          onChange={(e) => setCodeMethod(e.target.value as 'email-code')}
                          className="w-4 h-4"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Verification Code</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Receive a 6-digit code to enter here
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : `Send ${codeMethod === 'magic-link' ? 'Magic Link' : 'Code'}`}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or use another method</span>
                </div>
              </div>

              <Link href="/auth/password">
                <Button type="button" variant="outline" className="w-full bg-transparent">
                  Use Password Login
                </Button>
              </Link>
            </form>
          )}

          {/* Code Entry Step */}
          {step === 'code-entry' && codeMethod === 'email-code' && (
            <form onSubmit={handleCodeSubmit} className="space-y-6">
              <div className="space-y-4">
                <Label>Enter 6-digit verification code</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                    value={code}
                    onChange={setCode}
                    disabled={loading}
                    render={({ slots }) => (
                      <div className="flex gap-2">
                        {slots.map((slot, idx) => (
                          <div
                            key={idx}
                            className="w-12 h-12 border border-border rounded-lg flex items-center justify-center bg-card font-semibold text-lg"
                          >
                            {slot}
                          </div>
                        ))}
                      </div>
                    )}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
                {loading ? 'Verifying...' : 'Verify Code'}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent"
                onClick={handleResendCode}
                disabled={loading}
              >
                Did not receive code? Resend
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setStep('email-entry');
                  setCode('');
                  setError('');
                }}
              >
                Back
              </Button>
            </form>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">✓</span>
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-foreground font-medium">Authentication successful!</p>
                <p className="text-sm text-muted-foreground">
                  You are now logged in. Redirecting to your dashboard...
                </p>
              </div>

              <Button className="w-full" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          )}

          {/* Footer Links */}
          <div className="mt-8 flex gap-4 justify-center text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>•</span>
            <a href="#" className="hover:text-foreground transition-colors">
              Security
            </a>
            <span>•</span>
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
          </div>
        </Card>
      </div>
    </main>
  );
}
