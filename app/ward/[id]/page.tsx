// Server Component — owns generateStaticParams for static export.
// The actual UI lives in ward-detail.tsx ('use client').
// Suspense is required because ward-detail uses use(params) to unwrap
// the async params Promise — without a boundary React emits a console error.
import { Suspense } from "react";
import { wards } from "@/lib/data";
import WardDetail from "./ward-detail";

export function generateStaticParams() {
  return wards.map((ward) => ({ id: ward.id }));
}

export default function WardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <WardDetail params={params} />
    </Suspense>
  );
}
