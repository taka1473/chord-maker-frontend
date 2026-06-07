import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-border py-6 text-center text-sm text-muted">
      <nav className="flex justify-center gap-6">
        <Link href="/privacy-policy" className="hover:text-foreground transition-colors">
          プライバシーポリシー
        </Link>
      </nav>
      <p className="mt-2">© {new Date().getFullYear()} せっきー</p>
    </footer>
  );
}
