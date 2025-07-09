import {
  getProjectCategories,
  getProjectCategory,
  getProjects,
} from "~/models/project.server";
import { Route } from "./+types";
import { Link, MetaFunction, NavLink, Outlet, useParams } from "react-router";
import { cn, constructSlug, getImageURL } from "~/lib/utils";
import { PageHeading } from "~/components/heading";
import { siteConfig } from "~/config/site";
import { Card } from "~/components/ui/card";
import { ArrowRightIcon } from "@radix-ui/react-icons";

// TODO RENDER PROJECT BASED ON CATEGORY FROM SERACH PARAMS

export async function loader({ request }: Route.LoaderArgs) {
  const searchParams = new URL(request.url).searchParams;
  const categoryParam = searchParams.get("categoryId");
  let category = undefined;

  if (categoryParam) {
    category = await getProjectCategory(categoryParam);
  }

  const projects = await getProjects(category?.id);
  const categories = await getProjectCategories();

  return { categories, projects, category };
}

export const meta: MetaFunction = ({ data }) => {
  return [{ title: `Выполненные проекты - ${siteConfig.name}` }];
};

export default function ProjectsPage({ loaderData }: Route.ComponentProps) {
  const { categories, projects, category } = loaderData;
  const currentCateogry = category;

  const breadcrumbs = [
    {
      label: "Проекты",
      url: "/projects",
    },
  ];

  if (currentCateogry) {
    breadcrumbs.push({
      label: currentCateogry.name,
      url: `/projects/${currentCateogry.slug}`,
    });
  }
  const title = currentCateogry ? currentCateogry.name : "Проекты";

  return (
    <div className="flex-1">
      <PageHeading
        title={title}
        breadcrumbs={breadcrumbs}
        className="mt-12 mb-8"
      />

      <div className="container mx-auto">
        <div className="mb-8 border-b">
          <nav className="flex flex-wrap gap-x-8">
            <Link
              className={cn(
                "whitespace-nowrap py-4 px-1 border-b-2 font-medium transition-colors text-sm",
                !currentCateogry
                  ? "border-primary text-primary pointer-events-none"
                  : "border-transparent hover:text-primary/70 hover:border-primary/70"
              )}
              to={{
                search: undefined,
              }}
              prefetch="intent"
            >
              Все проекты
            </Link>

            {categories.map((category) => (
              <Link
                key={category.id}
                className={cn(
                  "whitespace-nowrap py-4 px-1 border-b-2 font-medium transition-colors text-sm",
                  currentCateogry?.id === category.id
                    ? "border-primary text-primary pointer-events-none"
                    : "border-transparent hover:text-primary/70 hover:border-primary/70"
                )}
                to={{
                  search: `?categoryId=${category.id}`,
                }}
                prefetch="intent"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <ProjectList projects={projects} />
    </div>
  );
}

function ProjectList({
  projects,
}: {
  projects: {
    id: number;
    name: string;
    slug: string;
    images: { uri: string }[];
  }[];
}) {
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
                to={`/projects/${constructSlug(project)}`}
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
