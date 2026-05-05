"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      try {
        // Try to call backend logout endpoint
        // await api.post("/auth/logout");
      } catch (error) {
        // We still want to clear local storage and redirect even if the server call fails
        console.error("Logout request failed:", error);
      } finally {
        // Clear tokens from local storage
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        // Redirect to home page
        router.push("/");
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
