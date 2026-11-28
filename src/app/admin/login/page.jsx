import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import AdminLoginClient from "@/components/AdminLoginClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Login | Betroverse",
};

export default async function AdminLoginPage() {
  const user = await getSessionUser();
  if (user) {
    redirect("/admin");
  }
  return <AdminLoginClient />;
}
