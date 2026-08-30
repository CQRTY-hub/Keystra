import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { VerifyForm } from "@/components/admin/VerifyForm";
import { hasValidLoginChallenge } from "@/lib/admin/session";
import { getMessages } from "@/i18n";

const t = getMessages();

export const metadata: Metadata = {
  title: t.pageTitles.adminVerify,
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AdminVerifyPage() {
  // Can't reach this step without having passed step 1 first — no
  // challenge cookie (or an expired/already-consumed one) sends you back
  // to start over, same as requireAdminSession() does for the dashboard.
  if (!(await hasValidLoginChallenge())) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-sm">
        <h1 className="text-headline-md text-on-surface">{t.admin.verify.title}</h1>
        <p className="text-body-md mt-2 text-secondary">{t.admin.verify.intro}</p>
        <div className="mt-6">
          <VerifyForm />
        </div>
      </div>
    </div>
  );
}
