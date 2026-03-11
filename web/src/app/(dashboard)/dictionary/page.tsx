import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getLocaleFromCookie, getDictionary } from "@/lib/locale-server";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default async function DictionaryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");
  const locale = await getLocaleFromCookie();
  const dictionary = getDictionary(locale);
  const t = dictionary.dictionary;
  const nav = dictionary.nav;

  const entries = await prisma.dictionaryEntry.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{nav.dictionary}</h1>
      {entries.length === 0 ? (
        <p className="text-muted-foreground">{t.noEntries}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <Card key={entry.id} className="overflow-hidden">
              <Link href={`/dictionary/${entry.id}`} className="block">
                {entry.image ? (
                  <div className="relative aspect-video w-full bg-muted">
                    <Image
                      src={entry.image}
                      alt={entry.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-muted flex items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
                <CardContent className="p-4">
                  <h2 className="font-semibold">{entry.title}</h2>
                  {entry.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {entry.description}
                    </p>
                  )}
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
