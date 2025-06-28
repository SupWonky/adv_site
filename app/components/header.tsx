import { type ServiceNode } from "~/models/service.server";
import { mapToNavigationItems, NavigationMenu } from "./navigation-menu";
import React from "react";
import { Link } from "react-router";
import { siteConfig } from "~/config/site";
import { MainNav } from "./main-nav";
import { ProjectCategory } from "@prisma/client";
import { Sidebar } from "./sidebar";
import { useMediaQuery } from "~/hooks/use-media-query";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";
import { Phone } from "lucide-react";
import { useModal } from "./providers/modal-provider";
import { useScroll } from "~/hooks/use-scroll";

type SiteHeaderProps = {
  services: ServiceNode[];
  projectCategoires: ProjectCategory[];
};

export function SiteHeader({ services, projectCategoires }: SiteHeaderProps) {
  const serviceMenuItems = React.useMemo(() => {
    const serviceItems = mapToNavigationItems(services, {
      getLabelFn: (item) => item.name,
      getUrlFn: (item) => `/services/${item.url}`,
      getChildrenFn: (item) => item.children,
    });

    return {
      label: "Направления",
      url: "/services",
      type: "nested" as "nested" | "item",
      children: serviceItems,
    };
  }, [services]);
  const projectCategoiresItems = React.useMemo(() => {
    return {
      label: "Проекты",
      url: "/projects",
      type: "nested" as "nested" | "item",
      children: projectCategoires.map((item) => ({
        label: item.name,
        url: `/projects/${item.slug}`,
        type: "item" as "nested" | "item",
      })),
    };
  }, [projectCategoires]);
  const { setModal } = useModal();
  const { scrollY } = useScroll();

  return (
    <>
      <div className={cn("top-0 z-50 w-full bg-background hidden lg:block")}>
        <div className="container mx-auto py-2">
          <MainNav />
        </div>

        <NavigationMenu items={[serviceMenuItems, projectCategoiresItems]} />
      </div>

      <div
        className={cn(
          "top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/65 border-b fixed transition-transform will-change-transform duration-200 hidden lg:block",

          scrollY < 250 ? "-translate-y-full" : "translate-y-0"
        )}
      >
        <div className="container mx-auto h-14 flex items-center justify-between">
          <div className="flex gap-4">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold ">{siteConfig.name}</span>
            </Link>
            <NavigationMenu
              items={[serviceMenuItems, projectCategoiresItems]}
              classNames={{
                itemStyle:
                  "hover:bg-transparent aria-expanded:border-b border-primary bg-transparent text-foreground",
                containerStyle: "bg-transparent",
              }}
            />
          </div>
          <Button
            className="px-2 hover:bg-transparent"
            variant="ghost"
            onClick={() => setModal("call")}
          >
            <Phone className="!size-5 text-primary" />
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "top-0 z-50 w-full bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/65 border-b sticky lg:hidden"
        )}
      >
        <div className="container mx-auto h-14 flex items-center justify-between">
          <Sidebar items={[serviceMenuItems]} />
          <div className="hidden lg:flex gap-4">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold ">{siteConfig.name}</span>
            </Link>
            <NavigationMenu
              items={[serviceMenuItems, projectCategoiresItems]}
              classNames={{
                itemStyle:
                  "hover:bg-transparent aria-expanded:border-b border-primary bg-transparent text-foreground",
                containerStyle: "bg-transparent",
              }}
            />
          </div>
          <Button
            className="px-2 hover:bg-transparent"
            variant="ghost"
            onClick={() => setModal("call")}
          >
            <Phone className="!size-5 text-primary" />
          </Button>
        </div>
      </div>
    </>
  );
}
