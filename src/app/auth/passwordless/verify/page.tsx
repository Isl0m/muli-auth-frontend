"use client";

import api from "@/lib/axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyPasswordlessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // Use state to manage the UI lifecycle
  const [status, setStatus] = useState<"loading" | "error" | "invalid">(
    "loading",
  );

  useEffect(() => {
    // 1. Immediate validation
    if (!token) {
      setStatus("invalid");
      return;
    }

    // 2. Define the async logic
    const verifyToken = async () => {
      try {
        const response = await api.post("/auth/passwordless/verify", { token });

        if (response.status === 200) {
          localStorage.setItem("access_token", response.data.token);
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

  if (status === "invalid") {
    return (
      <div className="p-10 text-2xl text-red-500">
        Invalid or missing token.
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="p-10 text-2xl text-red-500">
        Verification failed. The link may have expired.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="mt-4 text-xl">Verifying your login...</p>
    </div>
  );
}
