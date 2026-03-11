import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getLocaleFromCookie, getDictionary } from "@/lib/locale-server";
import { MotorcycleForm } from "../motorcycle-form";

export default async function NewMotorcyclePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");
  const locale = await getLocaleFromCookie();
  const dictionary = getDictionary(locale);
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">{dictionary.garage.add}</h1>
      <MotorcycleForm dictionary={dictionary} />
    </div>
  );
}
