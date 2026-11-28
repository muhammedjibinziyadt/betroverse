import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import AdminClient from "@/components/AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/admin/login");
  }
  return <AdminClient initialUser={user} />;
}
