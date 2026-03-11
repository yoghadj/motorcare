import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getLocaleFromCookie, getDictionary } from "@/lib/locale-server";
import { MotorcycleForm } from "../../motorcycle-form";

export default async function EditMotorcyclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) redirect("/login");

  const motorcycle = await prisma.motorcycle.findFirst({
    where: { id, userId: user.id, deletedAt: null },
  });
  if (!motorcycle) notFound();

  const locale = await getLocaleFromCookie();
  const dictionary = getDictionary(locale);

  const serialized = {
    ...motorcycle,
    purchaseDate: motorcycle.purchaseDate
      ? motorcycle.purchaseDate.toISOString().slice(0, 10)
      : null,
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">{dictionary.garage.edit}</h1>
      <MotorcycleForm dictionary={dictionary} motorcycle={serialized} />
    </div>
  );
}
