import React from "react";
import { useMounted } from "~/hooks/use-mounted";

export function ClientOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const mounted = useMounted();

  return mounted ? children : fallback;
}
