import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";
import { getMessages } from "@/i18n";

const t = getMessages();

export const metadata: Metadata = {
  title: t.pageTitles.adminLogin,
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-sm">
        <h1 className="text-headline-md text-on-surface">{t.admin.login.title}</h1>
        <p className="text-body-md mt-2 text-secondary">{t.admin.login.intro}</p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
