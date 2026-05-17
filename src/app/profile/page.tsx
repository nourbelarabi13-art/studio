"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { Loader2, Library } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-background dreamy-fantasy-gradient">
      <div className="flex flex-col items-center gap-6 text-center p-8">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <Library className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="space-y-2">
          <p className="text-muted-foreground italic font-body animate-pulse text-lg">Navigating the Archive...</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold">Seeking your personal chronicle</p>
        </div>
      </div>
    </div>
  );
}