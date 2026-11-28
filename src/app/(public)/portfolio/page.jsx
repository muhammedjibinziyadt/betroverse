import { getAllProjects } from "@/lib/db";
import PortfolioClient from "@/components/PortfolioClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Portfolio | Betroverse",
  description:
    "Explore our premium branding, digital designs, video production, and social media campaigns.",
};

export default async function PortfolioPage() {
  const projects = await getAllProjects({ includeDrafts: false });
  return <PortfolioClient initialProjects={projects} />;
}
