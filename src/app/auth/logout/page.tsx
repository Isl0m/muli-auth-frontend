"use client";

import api from "@/lib/axios";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function LogoutPage() {
  const router = useRouter();
  const hasLoggedOut = useRef(false);

  useEffect(() => {
    const logout = async () => {
      if (hasLoggedOut.current) {
        return;
      }

      hasLoggedOut.current = true;

      try {
        await api.post("/auth/logout");
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.data) {
          console.error("Logout request failed:", error.response.data);
        } else {
          console.error("Logout request failed:", error);
        }
      } finally {
        router.replace("/");
      }
    };

    logout();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="bg-primary/10 p-4 rounded-full border border-primary/20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Signing out</h2>
        <p className="text-sm text-muted-foreground">
          Please wait while we securely end your session...
        </p>
      </div>
    </div>
  );
}
