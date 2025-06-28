import { useState } from "react";
import { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData, useSearchParams } from "react-router";
import { getProjectCategories, getProjects } from "~/models/project.server";
import { requireUserId } from "~/session.server";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import { cn, getImageURL } from "~/lib/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUserId(request);
  const projects = await getProjects();
  const categories = await getProjectCategories();
  return { projects, categories };
};

export default function ProjectsPage() {
  const { projects, categories } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("category") || "all"
  );

  // Handle tab change
  const handleTabChange = (category: string) => {
    setActiveTab(category);
    const params = new URLSearchParams(searchParams);
    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    setSearchParams(params);
  };

  const filteredProjects = projects.filter(
    (project) => activeTab === "all" || project.categoryId === activeTab
  );

  // Format date to Russian format
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="container mx-auto px-4 my-12">
      {/* Header area */}
      <div className="flex flex-col gap-8 mb-8 flex-wrap sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Проекты</h1>
          <p className="mt-1 text-muted-foreground">
            Управляйте вашими проектами
          </p>
        </div>
        <Button asChild className="pr-6 gap-2">
          <Link to="/admin/projects/new">
            <Plus className="h-4 w-4" />
            Добавить проект
          </Link>
        </Button>
      </div>

      {/* Filters and search */}
      <div className="mb-8 space-y-6">
        {/* Category tabs */}
        <div className="flex overflow-x-auto pb-2 hide-scrollbar">
          <div className="flex space-x-2">
            <button
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === "all"
                  ? "bg-primary text-white"
                  : "bg-muted hover:bg-muted/80"
              )}
              onClick={() => handleTabChange("all")}
            >
              Все проекты
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                  activeTab === category.id
                    ? "bg-primary text-white"
                    : "bg-muted hover:bg-muted/80"
                )}
                onClick={() => handleTabChange(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-lg text-muted-foreground font-medium mb-2">
            Проекты не найдены
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const category = categories.find(
              (c) => c.id === project.categoryId
            );
            // Get the first image from the relation
            const firstImage = project.images[0];

            return (
              <Link
                key={project.id}
                to={`${project.id}/edit`}
                className="group bg-card rounded-lg border overflow-hidden shadow hover:shadow-lg transition-shadow duration-200"
              >
                {/* Image container with aspect ratio */}
                <div className="w-full aspect-video">
                  {firstImage ? (
                    <img
                      src={getImageURL(firstImage.uri)}
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">
                        Нет изображения
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-lg group-hover:text-indigo-500 transition-colors line-clamp-1">
                      {project.name}
                    </h3>
                  </div>

                  {/* <div className="text-xs text-muted-foreground truncate mb-2">
                    {category && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                        {category.name}
                      </span>
                    )}
                  </div> */}

                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary mb-2">
                    {category?.name}
                  </span>

                  <div className="text-xs text-muted-foreground mt-2">
                    Обновлено: {formatDate(project.updatedAt)}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
