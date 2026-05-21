"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Client-side redirect — `redirect()` from next/navigation is not supported
// in static export mode (output: 'export'). useRouter().replace() is used instead.
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/planner");
  }, [router]);

  return null;
}
