"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from "@/lib/axios";
import axios from "axios";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type ApiError = {
  message?: string;
  error?: string;
  statusCode?: number;
};

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "error" | "invalid">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string>();

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await api.post("/auth/passwordless/verify", { token });
        if (response.data) {
          router.push("/dashboard");
        } else {
          setStatus("error");
        }
      } catch (error: unknown) {
        if (axios.isAxiosError<ApiError>(error) && error.response?.data) {
          setErrorMessage(error.response.data.message);
        }
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
                : (errorMessage ??
                  "Verification failed. Please try requesting a new magic link.")}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyPasswordlessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
