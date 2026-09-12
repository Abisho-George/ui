"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { homeFor, useAuth } from "@/lib/auth";
import { LoadingScreen } from "@/components/Shell";

export default function Index() {
  const { user, ready } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!ready) return;
    router.replace(user ? homeFor(user.role) : "/login");
  }, [ready, user, router]);
  return <LoadingScreen />;
}
