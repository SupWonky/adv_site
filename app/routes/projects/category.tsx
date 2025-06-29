import { getProjectCategory, getProjects } from "~/models/project.server";
import { Route } from "./+types/category";
import { Link } from "react-router";
import { getImageURL } from "~/lib/utils";
import { Card } from "~/components/ui/card";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { siteConfig } from "~/config/site";

export async function loader({ params }: Route.LoaderArgs) {
  const category = await getProjectCategory(params.categorySlug);

  if (!category) {
    throw new Response("Not Found", { status: 404 });
  }

  const projects = await getProjects(category.id);
  return { projects, category };
}

export const meta: Route.MetaFunction = ({ data }) => {
  return [
    { title: `Выполненные проекты ${data.category.name} - ${siteConfig.name}` },
  ];
};

export default function ProjectCategoryPage({
  loaderData,
}: Route.ComponentProps) {
  const { projects } = loaderData;

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h2 className="text-2xl font-semibold mb-4">Здесь пусто...</h2>
        <p className="text-gray-500">В данной категории нету проектов.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto mb-12">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10">
        {projects.map((project) => {
          const previewUrl = project.images[0]
            ? getImageURL(project.images[0].uri)
            : "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80";

          return (
            <Card
              key={project.id}
              className="relative h-96 overflow-hidden transition-all duration-300 hover:shadow-xl"
            >
              <Link
                to={`/project/${project.slug}`}
                className="flex h-full flex-col"
                aria-label={`View ${project.name} project`}
              >
                {/* Image Container */}
                <div className="group relative aspect-square overflow-hidden">
                  <img
                    src={previewUrl}
                    alt={`${project.name} project preview`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ">
                    <div className="flex items-center text-white will-change-transform transition-transform duration-300 group-hover:translate-y-0 translate-y-4">
                      <span className="font-medium">Смотреть проект</span>
                      <ArrowRightIcon className="ml-2 !size-5" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="mb-2 text-lg font-semibold">{project.name}</h3>
                </div>
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
