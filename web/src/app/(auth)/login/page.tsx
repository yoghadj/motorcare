import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { authOptions } from "@/lib/auth";
import { LoginForm } from "./login-form";
import { getLocaleFromCookie, getDictionary } from "@/lib/locale-server";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  const locale = await getLocaleFromCookie();
  const dictionary = getDictionary(locale);

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="flex flex-col items-center text-center">
        <Image
          src="/logo.png"
          alt={dictionary.common.appName}
          width={140}
          height={140}
          className="mb-3"
          priority
        />
        <h1 className="text-2xl font-bold">{dictionary.common.appName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {dictionary.auth.loginTitle}
        </p>
      </div>
      <LoginForm dictionary={dictionary} />
      <p className="text-center text-sm text-muted-foreground">
        <a href="/register" className="underline hover:text-foreground">
          {dictionary.auth.noAccount} {dictionary.auth.register}
        </a>
      </p>
    </div>
  );
}
