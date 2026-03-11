import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getLocaleFromCookie, getDictionary } from "@/lib/locale-server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { DeleteDictionaryButton } from "./delete-button";

export default async function DictionaryEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");
  const { id } = await params;
  const locale = await getLocaleFromCookie();
  const dictionary = getDictionary(locale);
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) redirect("/login");
  const isAdmin = (session.user as { role?: string }).role === "ADMIN";

  const entry = await prisma.dictionaryEntry.findUnique({
    where: { id },
  });
  if (!entry) notFound();

  const t = dictionary.dictionary;
  const common = dictionary.common;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{entry.title}</h1>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dictionary/${id}/edit`}>{t.edit}</Link>
            </Button>
            <DeleteDictionaryButton entryId={id} dictionary={dictionary} />
          </div>
        )}
      </div>
      <Card>
        {entry.image && (
          <div className="relative aspect-video w-full bg-muted">
            <Image
              src={entry.image}
              alt={entry.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        <CardContent className="p-6">
          {entry.description ? (
            <p className="whitespace-pre-wrap text-muted-foreground">{entry.description}</p>
          ) : (
            <p className="text-muted-foreground">No description.</p>
          )}
        </CardContent>
      </Card>
      <Button variant="ghost" asChild>
        <Link href="/dictionary">{common.back}</Link>
      </Button>
    </div>
  );
}
