import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getLocaleFromCookie, getDictionary } from "@/lib/locale-server";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SessionProvider } from "@/components/providers/session-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const locale = await getLocaleFromCookie();
  const dictionary = getDictionary(locale);
  const userRole = (session.user as { role?: string })?.role ?? "USER";

  return (
    <SessionProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          locale={locale}
          dictionary={dictionary}
          userRole={userRole}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header locale={locale} dictionary={dictionary} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
