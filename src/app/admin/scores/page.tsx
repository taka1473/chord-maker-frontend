import type { Metadata } from "next";
import { AdminScoresTable } from "@/features/admin/components/AdminScoresTable";

export const metadata: Metadata = {
  title: "スコア管理",
  robots: { index: false, follow: false },
};

export default function AdminScoresPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">スコア管理</h1>
      <AdminScoresTable />
    </div>
  );
}
