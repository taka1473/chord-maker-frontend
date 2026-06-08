"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin/users", label: "ユーザー" },
  { href: "/admin/scores", label: "スコア" },
  { href: "/admin/tags", label: "タグ" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="w-40 shrink-0 border-r border-border pr-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
        管理画面
      </p>
      <ul className="flex flex-col gap-1">
        {navItems.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className={`block rounded px-3 py-2 text-sm transition-colors hover:bg-primary/5 ${
                pathname.startsWith(href)
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-foreground"
              }`}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
