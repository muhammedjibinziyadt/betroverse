import { getAllBrands } from "@/lib/db";
import HomeClient from "@/components/HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const brands = await getAllBrands();
  return <HomeClient initialBrands={brands} />;
}
