"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios";
import { useForm } from "@tanstack/react-form";
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react";
import { useState } from "react";

export default function PasswordlessAuthPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await api.post("/auth/passwordless/send-magic-link", value);
        setSuccess(true);
      } catch (err: any) {
        setError("Transmission failure. Check system status.");
      }
    },
  });

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-2xl bg-muted border border-border/50">
            <Mail className="w-6 h-6 text-foreground" strokeWidth={1.2} />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Magic Link
        </CardTitle>
        <CardDescription>
          Secure one-time identity assertion link.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!success ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <form.Field
              name="email"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Recipient Identity</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    placeholder="name@example.com"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
              )}
            />

            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="ml-2 text-xs font-medium">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  className="w-full font-semibold"
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Mail className="w-4 h-4 mr-2" />
                  )}
                  {isSubmitting ? "Processing..." : "Dispatch Access Link"}
                </Button>
              )}
            />
          </form>
        ) : (
          <div className="py-6 flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground tracking-wider">
                Transmission Verified
              </p>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Identity assertion link dispatched to your inbox.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
