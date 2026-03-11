import { prisma } from "@/lib/db";
import { getLocaleFromCookie, getDictionary } from "@/lib/locale-server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default async function AdminUsersPage() {
  const locale = await getLocaleFromCookie();
  const dictionary = getDictionary(locale);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{dictionary.nav.users}</h1>
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">All users</h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 pr-4 font-medium">{dictionary.common.name}</th>
                  <th className="pb-2 pr-4 font-medium">{dictionary.common.email}</th>
                  <th className="pb-2 pr-4 font-medium">{dictionary.common.phone}</th>
                  <th className="pb-2 pr-4 font-medium">Role</th>
                  <th className="pb-2 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b">
                    <td className="py-2 pr-4">{u.name ?? "—"}</td>
                    <td className="py-2 pr-4">{u.email}</td>
                    <td className="py-2 pr-4">{u.phone ?? "—"}</td>
                    <td className="py-2 pr-4">{u.role}</td>
                    <td className="py-2">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
