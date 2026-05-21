// Server Component — owns generateStaticParams for static export.
// The actual UI lives in ward-detail.tsx ('use client').
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
  return <WardDetail params={params} />;
}
