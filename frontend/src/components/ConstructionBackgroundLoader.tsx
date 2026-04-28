"use client";

import dynamic from "next/dynamic";

const ConstructionBackground = dynamic(
  () => import("@/components/ConstructionBackground"),
  { ssr: false, loading: () => null }
);

export default function ConstructionBackgroundLoader() {
  return <ConstructionBackground />;
}
