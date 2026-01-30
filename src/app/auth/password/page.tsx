"use client";

import React from "react";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InputOTP } from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";

type AuthStep = "login" | "register" | "mfa";

export default function PasswordAuthPage() {
  const [step, setStep] = useState<AuthStep>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [enableMfa, setEnableMfa] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // API call would go here
      console.log("[v0] Login attempt:", { email, password });
      // Simulate MFA check
      if (enableMfa) {
        setStep("mfa");
      } else {
        // Success - redirect to dashboard
        console.log("[v0] Login successful");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      // API call would go here
      console.log("[v0] Registration attempt:", { email, password, enableMfa });
      // Simulate successful registration
      setStep("login");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // API call would go here
      console.log("[v0] MFA verification:", { email, mfaCode });
      // Success - redirect to dashboard
      console.log("[v0] MFA verification successful");
    } catch (err) {
      setError("Invalid MFA code. Please try again.");
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
              {step === "login" && "Sign In"}
              {step === "register" && "Create Account"}
              {step === "mfa" && "Verify MFA"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {step === "login" &&
                "Enter your credentials to access your account"}
              {step === "register" &&
                "Set up a new account with a secure password"}
              {step === "mfa" && "Enter the code from your authenticator app"}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="mb-6 border-destructive/50 bg-destructive/10">
              <AlertDescription className="text-destructive">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          {step === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
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
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="#"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-card"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => {
                  setStep("register");
                  setError("");
                }}
              >
                Create New Account
              </Button>

              <div className="flex gap-2">
                <input
                  type="checkbox"
                  id="mfa"
                  checked={enableMfa}
                  onChange={(e) => setEnableMfa(e.target.checked)}
                  className="w-4 h-4 rounded border-border"
                />
                <label
                  htmlFor="mfa"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Enable MFA on next login
                </label>
              </div>
            </form>
          )}

          {/* Register Form */}
          {step === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email Address</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-card"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-card"
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters long
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-card"
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="checkbox"
                  id="reg-mfa"
                  checked={enableMfa}
                  onChange={(e) => setEnableMfa(e.target.checked)}
                  className="w-4 h-4 rounded border-border"
                />
                <label
                  htmlFor="reg-mfa"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Set up MFA for this account
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => {
                  setStep("login");
                  setError("");
                  setEmail("");
                  setPassword("");
                  setConfirmPassword("");
                }}
              >
                Back to Sign In
              </Button>
            </form>
          )}

          {/* MFA Form */}
          {step === "mfa" && (
            <form onSubmit={handleMfaSubmit} className="space-y-6">
              <div className="space-y-4">
                <Label>Enter 6-digit code from your authenticator</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                    value={mfaCode}
                    onChange={setMfaCode}
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

              <Button
                type="submit"
                className="w-full"
                disabled={loading || mfaCode.length !== 6}
              >
                {loading ? "Verifying..." : "Verify Code"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => {
                  setStep("login");
                  setError("");
                  setMfaCode("");
                }}
              >
                Back
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Do not share your code with anyone
              </p>
            </form>
          )}
        </Card>
      </div>
    </main>
  );
}
