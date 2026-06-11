"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export function IdleWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // 1 hour = 60 * 60 * 1000 = 3600000 ms
      timeoutId = setTimeout(() => {
        Cookies.remove("auth_token");
        router.push("/login");
      }, 3600000);
    };

    // Events that denote user activity
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    const handleUserActivity = () => {
      resetTimer();
    };

    // Initialize timer on mount
    resetTimer();

    // Attach event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    // Cleanup on unmount
    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [router]);

  return <>{children}</>;
}
