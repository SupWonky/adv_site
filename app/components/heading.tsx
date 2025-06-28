import { Link } from "react-router";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import React from "react";
import { useMediaQuery } from "~/hooks/use-media-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

interface BreadCrumbsItem {
  label: string;
  url?: string;
}

interface PageHeadingProps {
  className?: string;
  title: string;
  breadcrumbs: BreadCrumbsItem[];
}

export function PageHeading({
  className,
  title,
  breadcrumbs,
}: PageHeadingProps) {
  const isMobile = useMediaQuery("(max-width: 1024px)");

  return (
    <div className={className}>
      <div className="container mx-auto !px-4 py-6 lg:!px-6 flex flex-col gap-2 lg:rounded-lg bg-card border lg:shadow">
        <div className="w-full overflow-hidden">
          <Breadcrumb className="whitespace-nowrap overflow-hidden">
            <BreadcrumbList className="flex-nowrap overflow-hidden">
              <BreadcrumbItem className="flex-shrink-0">
                <BreadcrumbLink asChild>
                  <Link to="/">Главная</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="flex-shrink-0" />
              {isMobile ? (
                <>
                  <BreadcrumbItem className="flex-shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <BreadcrumbEllipsis className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="max-w-xs" align="start">
                        {breadcrumbs.map((item, idx) => (
                          <DropdownMenuItem key={idx} asChild>
                            {item.url && (
                              <Link to={item.url}>{item.label}</Link>
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="flex-shrink-0" />
                </>
              ) : (
                <>
                  {breadcrumbs
                    .slice(0, breadcrumbs.length - 1)
                    .map((item, idx) => (
                      <React.Fragment key={idx}>
                        <BreadcrumbItem className="flex-shrink-0 min-w-0">
                          <BreadcrumbLink asChild className="truncate block">
                            {item.url && (
                              <Link to={item.url} className="truncate block">
                                {item.label}
                              </Link>
                            )}
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="flex-shrink-0" />
                      </React.Fragment>
                    ))}
                </>
              )}
              <BreadcrumbItem className="min-w-0 flex-shrink truncate">
                <BreadcrumbPage className="truncate block">
                  {breadcrumbs[breadcrumbs.length - 1].label}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <h1 className="text-2xl lg:text-3xl font-medium line-clamp-3">
          {title}
        </h1>
      </div>
    </div>
  );
}
