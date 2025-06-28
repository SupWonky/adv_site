import { Link, NavLink, useLocation } from "react-router";
import { ChevronDown, ChevronRight } from "lucide-react";
import * as React from "react";
import { cn } from "~/lib/utils";
import { getServicesTree } from "~/models/service.server";

type ServiceList = Awaited<ReturnType<typeof getServicesTree>>;
type ServiceNode = ServiceList[0];

interface ServiceMenuProps {
  services: ServiceList;
}

export function ServiceMenu({ services }: ServiceMenuProps) {
  const [open, setOpen] = React.useState(false);
  const location = useLocation();
  const timeoutRef = React.useRef<number>();

  const handleMouseLeave = (e: React.MouseEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    const isInsideMenu =
      relatedTarget?.closest("[data-menu-container]") !== null;

    if (!isInsideMenu) {
      timeoutRef.current = setTimeout(() => setOpen(false), 300);
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpen(true);
  };

  React.useEffect(() => {
    setOpen(false);
  }, [location]);

  return (
    <div
      className="relative h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-menu-container
    >
      <NavLink
        className={({ isActive }) =>
          `flex items-center h-full px-4 gap-1.5 font-medium text-background hover:bg-green-700 transition-colors duration-200 ${
            isActive || open ? "bg-green-700" : ""
          }`
        }
        aria-expanded={open}
        aria-haspopup="true"
        to="/services"
      >
        <span>Направления</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 shrink-0 transition-transform duration-200 ease-in-out",
            open && "rotate-180"
          )}
        />
      </NavLink>

      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 top-full min-w-56 text-foreground bg-background rounded-b-md shadow-lg border z-10 transform origin-top-left transition-all duration-200 ease-in-out",
          open
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        )}
        role="menu"
        data-menu-container
      >
        <ul>
          {services.map((service) => (
            <ServiceItem key={service.id} service={service} />
          ))}
        </ul>
      </div>
    </div>
  );
}

function ServiceItem({ service }: { service: ServiceNode }) {
  const [open, setOpen] = React.useState(false);
  const hasChildren = service.children.length > 0;

  return (
    <li
      className="relative group border-b last:border-none"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        to={`/services/${service.slug}`}
        className={cn(
          "flex items-center justify-between px-4 py-2 text-sm rounded-md text-gray-800 hover:bg-gray-50 hover:text-primary whitespace-nowrap w-full transition-all duration-200",
          open && "bg-gray-50 text-primary"
        )}
        role="menuitem"
      >
        <span className="mr-2">{service.name}</span>
        {hasChildren && <ChevronRight className="h-4 w-4 text-gray-500" />}
      </Link>

      {hasChildren && (
        <div
          className={cn(
            "absolute left-full top-0 min-w-56 rounded-md shadow-lg bg-background border z-20 transform transition-all duration-200 ease-in-out",
            open
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 pointer-events-none"
          )}
          role="menu"
          data-menu-container
        >
          <ul>
            {service.children.map((subservice) => (
              <ServiceItem key={subservice.id} service={subservice} />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}
