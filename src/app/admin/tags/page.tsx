import type { Metadata } from "next";
import { AdminTagsTable } from "@/features/admin/components/AdminTagsTable";

export const metadata: Metadata = {
  title: "タグ管理",
  robots: { index: false, follow: false },
};

export default function AdminTagsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">タグ管理</h1>
      <AdminTagsTable />
    </div>
  );
}
