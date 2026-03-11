import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ForgotPasswordForm } from "./forgot-password-form";
import { getLocaleFromCookie, getDictionary } from "@/lib/locale-server";

export default async function ForgotPasswordPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  const locale = await getLocaleFromCookie();
  const dictionary = getDictionary(locale);

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{dictionary.common.appName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {dictionary.auth.forgotPassword}
        </p>
      </div>
      <ForgotPasswordForm dictionary={dictionary} />
      <p className="text-center text-sm text-muted-foreground">
        <a href="/login" className="underline hover:text-foreground">
          {dictionary.common.back} to login
        </a>
      </p>
    </div>
  );
}
