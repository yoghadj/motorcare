import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getLocaleFromCookie, getDictionary } from "@/lib/locale-server";
import { ProfileForm } from "./profile-form";
import { ChangePasswordForm } from "./change-password-form";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const locale = await getLocaleFromCookie();
  const dictionary = getDictionary(locale);

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, name: true, phone: true },
  });
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">{dictionary.auth.profile}</h1>
      <ProfileForm dictionary={dictionary} initial={user} />
      <ChangePasswordForm dictionary={dictionary} />
    </div>
  );
}
