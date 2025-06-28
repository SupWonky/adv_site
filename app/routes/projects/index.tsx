import { getProjectCategories } from "~/models/project.server";
import { Route } from "./+types";
import { NavLink, Outlet, useParams } from "react-router";
import { cn } from "~/lib/utils";
import { PageHeading } from "~/components/heading";

export async function loader() {
  const categories = await getProjectCategories();

  return { categories };
}

export default function ProjectsPage({ loaderData }: Route.ComponentProps) {
  const { categories } = loaderData;
  const params = useParams();
  const categorySlug = params.categorySlug;

  const currentCateogry = categorySlug
    ? categories.find((category) => category.slug === categorySlug)
    : undefined;
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
            <NavLink
              className={({ isActive }) =>
                cn(
                  "whitespace-nowrap py-4 px-1 border-b-2 font-medium transition-colors text-sm",
                  isActive
                    ? "border-primary text-primary pointer-events-none"
                    : "border-transparent hover:text-primary/70 hover:border-primary/70"
                )
              }
              to="/projects"
              end
            >
              Все проекты
            </NavLink>

            {categories.map((category) => (
              <NavLink
                key={category.id}
                className={({ isActive }) =>
                  cn(
                    "whitespace-nowrap py-4 px-1 border-b-2 font-medium transition-colors text-sm",
                    isActive
                      ? "border-primary text-primary pointer-events-none"
                      : "border-transparent hover:text-primary/70 hover:border-primary/70"
                  )
                }
                to={`${category.slug}`}
              >
                {category.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
