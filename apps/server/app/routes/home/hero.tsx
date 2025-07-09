import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { cn, constructSlug } from "~/lib/utils";

// Define the type for a service item
interface ServiceItem {
  id: string;
  name: string;
  image?: string;
  url?: string;
}

export function ServicesSection({ services }: { services: ServiceItem[] }) {
  return (
    <section className="w-full bg-white py-16">
      <div className="container">
        {/* Main heading with improved spacing and sizing */}
        <h2 className="text-3xl font-medium text-center mb-20">
          Создание инженерных коммуникаций «под ключ»
        </h2>

        {/* Services section with improved spacing */}
        <div className="mb-16 flex">
          <div className="grid grid-cols-12 gap-8">
            {/* Left side - Company information with improved typography */}
            <div className="col-span-12 lg:col-span-3 flex flex-col space-y-6">
              <div>
                <div className="flex justify-between items-center mb-12">
                  <h2 className="text-2xl font-medium">Наши услуги</h2>
                </div>
                <p className="text-lg leading-relaxed mb-6">
                  ООО «Аванте» осуществляет проектирование систем вентиляции,
                  дымоудаления, отопления и кондиционирования, поставляет
                  оборудование, выполняет его монтаж.
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Мы даем гарантию, что предлагаемое нами проектное решение
                  обеспечит необходимые условия по температуре, влажности и
                  чистоте воздуха.
                </p>
              </div>
              <Button
                className="font-medium px-6 py-2 transition-colors duration-300"
                variant="outline"
                asChild
              >
                <Link to="/services" prefetch="intent">
                  Все услуги
                </Link>
              </Button>
            </div>

            {/* Right side - Service grid with consistent styling */}
            <div className="col-span-12 lg:col-span-9">
              <div className="grid grid-cols-12 gap-4">
                {/* First row services */}
                <ServiceCard
                  service={services[0]}
                  className="col-span-6 lg:col-span-6"
                />
                <ServiceCard
                  service={services[1]}
                  className="col-span-6 lg:col-span-3"
                />
                <ServiceCard
                  service={services[2]}
                  className="col-span-6 lg:col-span-3"
                />

                {/* Second row services */}
                <ServiceCard
                  service={services[3]}
                  className="col-span-6 lg:col-span-3"
                />
                <ServiceCard
                  service={services[4]}
                  className="col-span-6 lg:col-span-3"
                />
                <ServiceCard
                  service={services[5]}
                  className="col-span-6 lg:col-span-6"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Extracted service card component for consistency and reusability
function ServiceCard({
  service,
  className,
}: {
  service: ServiceItem;
  className?: string;
}) {
  return (
    <Link
      className={cn(
        "relative overflow-hidden group rounded-lg border shadow-md",
        className
      )}
      to={`/services/${service?.url}`}
      prefetch="intent"
    >
      <img
        src={
          service?.image ||
          "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
        }
        alt={service?.name}
        className="w-full h-64 object-cover will-change-transform transition-transform duration-500 group-hover:scale-125"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 w-full p-4">
        <span className="inline-block bg-primary text-white px-4 py-2 text-sm font-medium rounded-md shadow-lg transform transition-transform duration-300">
          {service.name}
        </span>
      </div>
    </Link>
  );
}

// Define TypeScript interface for project data
interface Project {
  id: number;
  title: string;
  category: string;
  slug: string;
  imageUrl?: string;
}

// Props for the ProjectShowcase component
interface ProjectShowcaseProps {
  projects: Project[];
}

export function ProjectSection({ projects }: ProjectShowcaseProps) {
  return (
    <section className="w-full py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
          {/* Title and "View All" section */}
          <Link
            to="/projects"
            className="bg-primary text-white p-8 flex flex-col justify-between min-h-[300px] relative overflow-hidden group"
            prefetch="intent"
          >
            <h2 className="text-3xl font-semibold mb-4">Выполненные проекты</h2>
            <div className="w-16 h-1 bg-white/60 mb-6"></div>
            <p className="text-white/80 mb-8 text-sm">
              Ознакомьтесь с нашими лучшими работами в различных отраслях
            </p>
            <div className="inline-flex items-center text-white">
              <span className="font-medium">Все проекты</span>
            </div>
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 rounded-full transform translate-x-16 translate-y-16"></div>
            <div className="absolute left-8 top-20 w-16 h-16 bg-white/5 rounded-full"></div>
          </Link>

          {/* Project cards */}
          {projects.map((project) => (
            <Link
              key={project.id}
              className="relative overflow-hidden group h-[300px] cursor-pointer"
              to={`/projects/${constructSlug(project)}`}
              prefetch="intent"
            >
              <img
                src={
                  project?.imageUrl ||
                  "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
                }
                alt={project.title}
                className="w-full h-full object-cover will-change-transform transition-transform duration-500 group-hover:scale-125"
              />

              {/* Info overlay - only visible on hover */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent 
                            opacity-0 group-hover:opacity-100
                            flex flex-col justify-end p-6 text-white
                            transition-opacity duration-300"
              >
                <div className="transform transition-transform will-change-transform duration-300 group-hover:-translate-y-2">
                  <div className="text-xs uppercase tracking-wider mb-2 font-light text-primary-light">
                    {project.category}
                  </div>
                  <h3 className="text-lg font-medium mb-2">{project.title}</h3>
                  <div className="w-12 h-0.5 bg-primary mt-3 mb-4"></div>
                  <div className="inline-flex items-center text-sm">
                    <span>Подробнее</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
