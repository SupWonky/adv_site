import type { MetaFunction } from "react-router";
import { siteConfig } from "~/config/site";
import { ProjectSection, ServicesSection } from "./hero";
import { Route } from "./+types";
import { getPopularServices } from "~/models/service.server";
import { getImageURL } from "~/lib/utils";
import { getPopularProjects } from "~/models/project.server";
import { HeroSlider } from "~/components/slider";

export const meta: MetaFunction = () => {
  return [
    { title: `${siteConfig.name} - Главаня` },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader({}: Route.LoaderArgs) {
  const popularServices = await getPopularServices(6);
  const popularProjects = await getPopularProjects(7);

  return { popularServices, popularProjects };
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { popularServices, popularProjects } = loaderData;

  return (
    <main className="flex-1 flex-shrink-0">
      <HeroSlider />
      <ServicesSection
        services={popularServices.map((service) => ({
          id: service.id,
          name: service.name,
          url: service.url || "",
          image: service.image ? getImageURL(service.image.uri) : undefined,
        }))}
      />
      <ProjectSection
        projects={popularProjects.map((project) => ({
          id: project.id,
          title: project.name,
          category: project.category.name,
          imageUrl: project.images[0]
            ? getImageURL(project.images[0].uri)
            : undefined,
          slug: project.slug,
        }))}
      />
    </main>
  );
}
