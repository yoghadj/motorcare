import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getLocaleFromCookie, getDictionary } from "@/lib/locale-server";
import { Button } from "@/components/ui/button";
import { AdminDeleteDictionaryButton } from "./admin-delete-button";

export default async function AdminDictionaryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");
  if ((session.user as { role?: string }).role !== "ADMIN") redirect("/dashboard");

  const locale = await getLocaleFromCookie();
  const dictionary = getDictionary(locale);
  const t = dictionary.dictionary;
  const nav = dictionary.nav;

  const entries = await prisma.dictionaryEntry.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{nav.dictionaryManage}</h1>
        <Button asChild>
          <Link href="/dictionary/new">{t.add}</Link>
        </Button>
      </div>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Title</th>
              <th className="px-4 py-3 text-left font-medium">Owner</th>
              <th className="px-4 py-3 text-left font-medium">Created</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b last:border-0">
                <td className="px-4 py-3">{entry.title}</td>
                <td className="px-4 py-3">
                  {entry.user.name ?? entry.user.email}
                </td>
                <td className="px-4 py-3">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dictionary/${entry.id}`}>View</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="ml-2">
                    <Link href={`/dictionary/${entry.id}/edit`}>{t.edit}</Link>
                  </Button>
                  <AdminDeleteDictionaryButton entryId={entry.id} dictionary={dictionary} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {entries.length === 0 && (
        <p className="text-muted-foreground">{t.noEntries}</p>
      )}
    </div>
  );
}
