
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { Loader2 } from "lucide-react";

/**
 * A root profile component that guides travelers to their personal UID-based scroll.
 * This ensures that links to just "/profile" are correctly resolved.
 */
export default function ProfileRootRedirect() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push(`/profile/${user.uid}`);
      } else {
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground italic font-body animate-pulse">Navigating the Archive...</p>
      </div>
    </div>
  );
}
