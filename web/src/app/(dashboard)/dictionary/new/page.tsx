import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getLocaleFromCookie, getDictionary } from "@/lib/locale-server";
import { DictionaryEntryForm } from "../dictionary-entry-form";

export default async function NewDictionaryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");
  if ((session.user as { role?: string }).role !== "ADMIN") redirect("/dictionary");
  const locale = await getLocaleFromCookie();
  const dictionary = getDictionary(locale);
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">{dictionary.dictionary.add}</h1>
      <DictionaryEntryForm dictionary={dictionary} />
    </div>
  );
}
