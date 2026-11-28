import { getAllProjects, getProjectBySlugOrId } from "@/lib/db";
import CaseStudyClient from "@/components/CaseStudyClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = await getProjectBySlugOrId(slug);
  if (!project) {
    return { title: "Case Study | Betroverse" };
  }
  return {
    title: project.seo?.title || `${project.companyName} Case Study | Betroverse`,
    description:
      project.seo?.description || project.shortIntro || project.fullDescription,
    keywords: project.seo?.keywords || "",
  };
}

export default async function CaseStudyPage({ params }) {
  const { slug } = await params;
  const allProjects = await getAllProjects({ includeDrafts: false });
  const project =
    (await getProjectBySlugOrId(slug)) ||
    allProjects.find((p) => p.slug?.toLowerCase() === slug?.toLowerCase()) ||
    allProjects[0];

  if (!project) {
    notFound();
  }

  return <CaseStudyClient project={project} allProjects={allProjects} />;
}
