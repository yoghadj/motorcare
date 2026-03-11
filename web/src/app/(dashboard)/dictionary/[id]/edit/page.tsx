import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getLocaleFromCookie, getDictionary } from "@/lib/locale-server";
import { DictionaryEntryForm } from "../../dictionary-entry-form";

export default async function EditDictionaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");
  if ((session.user as { role?: string }).role !== "ADMIN") redirect("/dictionary");
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) redirect("/login");

  const entry = await prisma.dictionaryEntry.findUnique({
    where: { id },
  });
  if (!entry) notFound();

  const locale = await getLocaleFromCookie();
  const dictionary = getDictionary(locale);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">{dictionary.dictionary.edit}</h1>
      <DictionaryEntryForm dictionary={dictionary} entry={entry} />
    </div>
  );
}
