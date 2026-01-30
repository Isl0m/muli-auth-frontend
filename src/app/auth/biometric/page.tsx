"use client";

import React from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";

type AuthStep =
  | "method-select"
  | "email-entry"
  | "register-device"
  | "authenticate"
  | "success";

export default function BiometricAuthPage() {
  const [step, setStep] = useState<AuthStep>("method-select");
  const [email, setEmail] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [biometricType, setBiometricType] = useState<
    "fingerprint" | "face" | "key"
  >("fingerprint");

  const handleWebAuthnRegister = async () => {
    setError("");
    setLoading(true);

    try {
      // WebAuthn registration would go here
      console.log("[v0] WebAuthn registration:", {
        email,
        biometricType,
        deviceName,
      });

      // Simulate WebAuthn API call
      if (!window.PublicKeyCredential) {
        setError("WebAuthn is not supported on this browser");
        setLoading(false);
        return;
      }

      setSuccess("Biometric device registered successfully!");
      setStep("success");
    } catch (err) {
      setError("Failed to register device. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleWebAuthnAuthenticate = async () => {
    setError("");
    setLoading(true);

    try {
      console.log("[v0] WebAuthn authentication:", { email, biometricType });

      // Simulate WebAuthn API call
      if (!window.PublicKeyCredential) {
        setError("WebAuthn is not supported on this browser");
        setLoading(false);
        return;
      }

      setSuccess("Biometric authentication successful!");
      setStep("success");
    } catch (err) {
      setError("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("[v0] Email lookup:", { email });
      // Here you would check if the user exists and if they have any registered biometric devices
      // For demo, assume they don't have devices yet
      setStep("register-device");
    } catch (err) {
      setError("Email lookup failed. Please try again.");
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
              {step === "method-select" && "Biometric Authentication"}
              {step === "email-entry" && "Your Email"}
              {step === "register-device" &&
                `Register ${biometricType === "fingerprint" ? "Fingerprint" : biometricType === "face" ? "Face" : "Security Key"}`}
              {step === "authenticate" &&
                `Authenticate with ${biometricType === "fingerprint" ? "Fingerprint" : biometricType === "face" ? "Face" : "Security Key"}`}
              {step === "success" && "Success!"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {step === "method-select" &&
                "Choose how you want to authenticate using WebAuthn"}
              {step === "email-entry" &&
                "We need your email to connect your biometric"}
              {step === "register-device" &&
                "Follow the prompts on your device to register"}
              {step === "authenticate" && "Use your biometric to sign in"}
              {step === "success" && "You have been successfully authenticated"}
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

          {/* Success Alert */}
          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Method Selection Step */}
          {step === "method-select" && (
            <div className="space-y-4">
              <div
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  biometricType === "fingerprint"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setBiometricType("fingerprint")}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">👆</span>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      Fingerprint Scanner
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Use your fingerprint for quick and secure access
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Compatible with most modern devices
                    </p>
                  </div>
                  {biometricType === "fingerprint" && (
                    <div className="w-4 h-4 rounded-full bg-primary mt-1" />
                  )}
                </div>
              </div>

              <Button
                className="w-full mt-6"
                onClick={() => setStep("email-entry")}
              >
                Continue with{" "}
                {biometricType === "fingerprint"
                  ? "Fingerprint"
                  : biometricType === "face"
                    ? "Face"
                    : "Security Key"}
              </Button>
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
                {loading ? "Checking..." : "Continue"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep("method-select")}
              >
                Back
              </Button>
            </form>
          )}

          {/* Register Device Step */}
          {step === "register-device" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleWebAuthnRegister();
              }}
              className="space-y-6"
            >
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-foreground">
                  First time setting up? Let's register your{" "}
                  {biometricType === "fingerprint"
                    ? "fingerprint"
                    : biometricType === "face"
                      ? "face"
                      : "security key"}
                  .
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="device-name">Device Name (optional)</Label>
                <Input
                  id="device-name"
                  placeholder={`e.g., My ${biometricType === "fingerprint" ? "Phone" : biometricType === "face" ? "Laptop" : "YubiKey"}`}
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  disabled={loading}
                  className="bg-card"
                />
                <p className="text-xs text-muted-foreground">
                  This helps you identify the device later
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  📱 When you click "Register", you will be prompted to use your{" "}
                  {biometricType === "fingerprint"
                    ? "fingerprint"
                    : biometricType === "face"
                      ? "face"
                      : "security key"}{" "}
                  on your device.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? "Registering..."
                  : `Register ${biometricType === "fingerprint" ? "Fingerprint" : biometricType === "face" ? "Face" : "Security Key"}`}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep("email-entry")}
              >
                Back
              </Button>
            </form>
          )}

          {/* Authenticate Step */}
          {step === "authenticate" && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="text-6xl mb-4">
                  {biometricType === "fingerprint"
                    ? "👆"
                    : biometricType === "face"
                      ? "😊"
                      : "🔐"}
                </div>
                <p className="text-foreground font-medium">
                  Use your{" "}
                  {biometricType === "fingerprint"
                    ? "fingerprint"
                    : biometricType === "face"
                      ? "face"
                      : "security key"}
                </p>
              </div>

              <Button
                className="w-full"
                onClick={handleWebAuthnAuthenticate}
                disabled={loading}
              >
                {loading
                  ? "Authenticating..."
                  : `Authenticate with ${biometricType === "fingerprint" ? "Fingerprint" : biometricType === "face" ? "Face" : "Security Key"}`}
              </Button>

              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => setStep("email-entry")}
              >
                Back
              </Button>
            </div>
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
                <p className="text-foreground font-medium">
                  Authentication successful!
                </p>
                <p className="text-sm text-muted-foreground">
                  Your biometric credential has been verified. Redirecting to
                  your dashboard...
                </p>
              </div>

              <Button className="w-full" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
