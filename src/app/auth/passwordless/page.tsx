"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios";
import Link from "next/link";
import { useState } from "react";

type AuthStep = "email-entry" | "success";

export default function PasswordlessAuthPage() {
  const [step, setStep] = useState<AuthStep>("email-entry");
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setSuccess("");
    setLoading(true);

    try {
      await api.post("/auth/passwordless/send-magic-link", {
        email,
      });
      setStep("success");
    } catch (err) {
      console.error(err);
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
          {step === "email-entry" && (
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Passwordless Login
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your email to receive a secure login link or code.
              </p>
            </div>
          )}

          {/* Email Entry Step */}
          {step === "email-entry" && (
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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : `Send Magic Link`}
              </Button>
            </form>
          )}

          {/* Success Step */}
          {step === "success" && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">✓</span>
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-foreground font-medium">Email Sent!</p>
                <p className="text-sm text-muted-foreground">
                  Check your email for a magic link to log in.
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
