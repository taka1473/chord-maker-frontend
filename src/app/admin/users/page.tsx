import type { Metadata } from "next";
import { AdminUsersTable } from "@/features/admin/components/AdminUsersTable";

export const metadata: Metadata = {
  title: "ユーザー管理",
  robots: { index: false, follow: false },
};

export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">ユーザー管理</h1>
      <AdminUsersTable />
    </div>
  );
}
