import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">プライバシーポリシー</h1>

      <p className="mb-8 text-sm text-muted">施行日：2026年6月7日</p>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">1. 事業者情報</h2>
        <p>
          本サービス「Chordlet」は、以下の者が運営しています。
        </p>
        <ul className="mt-2 list-none space-y-1">
          <li>運営者：せっきー</li>
          <li>
            お問い合わせ：
            <a
              href="https://x.com/t_sekky_"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-70"
            >
              https://x.com/t_sekky_
            </a>
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">2. 収集する情報</h2>
        <p>本サービスでは、以下の情報を収集します。</p>
        <ul className="mt-2 list-disc space-y-1 pl-6">
          <li>
            メールアドレス・Google アカウント情報（Firebase Authentication
            を通じてアカウント作成時に取得）
          </li>
          <li>ユーザーが作成・保存したコード譜のデータ</li>
          <li>ハンドルネーム</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">3. 利用目的</h2>
        <p>収集した情報は、以下の目的のために利用します。</p>
        <ul className="mt-2 list-disc space-y-1 pl-6">
          <li>アカウントの認証・管理</li>
          <li>コード譜の作成・保存・共有機能の提供</li>
          <li>サービスの改善・不正利用の防止</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">4. 第三者への提供</h2>
        <p>
          法令に基づく場合を除き、収集した個人情報を第三者に提供することはありません。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">5. 外部サービスの利用</h2>
        <p>本サービスは認証機能に Firebase Authentication（Google LLC）を使用しています。Firebase のプライバシーポリシーについては、Google のプライバシーポリシーをご確認ください。</p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">6. 情報の管理</h2>
        <p>
          収集した個人情報は、不正アクセス・漏洩・紛失を防ぐため適切な管理を行います。ただし、インターネット上での完全なセキュリティを保証するものではありません。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">7. ポリシーの変更</h2>
        <p>
          本プライバシーポリシーは、必要に応じて改定することがあります。変更後のポリシーはこのページに掲載し、掲載時点から効力を生じます。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">8. お問い合わせ</h2>
        <p>
          プライバシーポリシーに関するお問い合わせは、X（旧 Twitter）の{" "}
          <a
            href="https://x.com/t_sekky_"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-70"
          >
            @t_sekky_
          </a>{" "}
          までご連絡ください。
        </p>
      </section>
    </div>
  );
}
