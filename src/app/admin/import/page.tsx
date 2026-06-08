import type { Metadata } from "next";
import { AdminImportForm } from "@/features/admin/components/AdminImportForm";

export const metadata: Metadata = {
  title: "スコアインポート",
  robots: { index: false, follow: false },
};

export default function AdminImportPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">スコアインポート</h1>
      <AdminImportForm />
    </div>
  );
}
