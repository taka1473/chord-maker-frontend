import { AdminGuard } from "@/features/auth";
import { AdminNav } from "@/features/admin/components/AdminNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex gap-8">
          <AdminNav />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
