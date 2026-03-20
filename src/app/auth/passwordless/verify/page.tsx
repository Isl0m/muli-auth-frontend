"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from "@/lib/axios";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "error" | "invalid">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await api.post("/auth/passwordless/verify", { token });
        if (response.data) {
           localStorage.setItem("access_token", response.data.accessToken);
           localStorage.setItem("refresh_token", response.data.refreshToken);
           router.push("/dashboard");
        } else {
           setStatus("error");
        }
      } catch (error) {
        console.error("Verification failed:", error);
        setStatus("error");
      }
    };

    verifyToken();
  }, [token, router]);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Verifying Identity
        </CardTitle>
        <CardDescription>
          {status === "loading"
            ? "Please wait while we authenticate your session."
            : status === "invalid"
            ? "The security token is missing or malformed."
            : "The verification link may have expired or already been used."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center py-6">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground animate-pulse">
              Establishing secure connection...
            </p>
          </div>
        )}

        {(status === "error" || status === "invalid") && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2 text-xs font-medium">
              {status === "invalid"
                ? "Invalid or missing token."
                : "Verification failed. Please try requesting a new magic link."}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyPasswordlessPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
