"use client";

import dynamic from "next/dynamic";

const ConstructionBackground = dynamic(
  () => import("@/components/ConstructionBackground"),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 -z-10 bg-[var(--color-background)]" />
    ),
  }
);

export default function ConstructionBackgroundLoader() {
  return <ConstructionBackground />;
}
