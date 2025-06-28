import { getProjectBySlug } from "~/models/project.server";
import { Route } from "./+types/project";
import {
  ArrowLeft,
  Calendar,
  Share2,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import { getImageURL } from "~/lib/utils";
import { PageHeading } from "~/components/heading";

export async function loader({ params }: Route.LoaderArgs) {
  const project = await getProjectBySlug(params.slug);

  if (!project) {
    throw new Response("Not Found", { status: 404 });
  }

  return { project };
}

export default function ProjectPage({ loaderData }: Route.ComponentProps) {
  const { project } = loaderData;
  const [isSaved, setIsSaved] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Format date to be more readable
  const formattedDate = new Date(project.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const totalSlides = project.images.length;

  // Handle image navigation
  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const breadcrumbs = [
    {
      label: "Проекты",
      url: "/projects",
    },
    {
      label: project.category.name,
      url: `/projects/${project.category.slug}`,
    },
    {
      label: project.name,
      url: `/project/${project.slug}`,
    },
  ];

  return (
    <div className="flex-1">
      {/* Navigation bar */}
      <PageHeading
        title={project.name}
        breadcrumbs={breadcrumbs}
        className="my-6 lg:my-8"
      />

      {/* Main content */}
      <div className="container !px-0 lg:px-4 mb-12">
        {/* Project header */}

        {/* Project images */}
        {project.images && project.images.length > 0 && (
          <div className="mb-8 lg:rounded-lg overflow-hidden bg-card border lg:shadow-md">
            <div className="relative aspect-video">
              <img
                src={
                  getImageURL(project.images[activeImageIndex]?.uri) ||
                  "/api/placeholder/800/450"
                }
                alt={`${project.name} - Image ${activeImageIndex + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Image navigation controls */}
              {project.images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur rounded-full py-1 px-3 text-white text-sm">
                  {activeImageIndex + 1} / {project.images.length}
                </div>
              )}

              {project.images.length > 1 && activeImageIndex !== 0 && (
                <button
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/70 text-white backdrop-blur rounded-full p-2 shadow-md"
                  onClick={prevImage}
                >
                  <ChevronLeft />
                </button>
              )}

              {project.images.length > 1 && (
                <button
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/70 text-white backdrop-blur rounded-full p-2 shadow-md"
                  onClick={nextImage}
                >
                  <ChevronRight />
                </button>
              )}
            </div>

            {/* Thumbnail navigation */}
            {project.images.length > 1 && (
              <div className="flex space-x-2 p-4 overflow-x-auto">
                {project.images.map((image, index) => (
                  <button
                    key={index}
                    className={`w-16 h-16 rounded overflow-hidden border-2 flex-shrink-0 transition-all ${
                      activeImageIndex === index
                        ? "border-primary opacity-100"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img
                      src={getImageURL(image.uri) || "/api/placeholder/64/64"}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
