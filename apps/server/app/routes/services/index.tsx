import { siteConfig } from "~/config/site";
import { Route } from "./+types";
import { getServicesTree, ServiceNode } from "~/models/service.server";
import { PageHeading } from "~/components/heading";
import { Menu, MenuItemProps } from "./menu";
import { useMemo } from "react";
import { getImageURL } from "~/lib/utils";
import { Link } from "react-router";

export const meta: Route.MetaFunction = ({ data }) => {
  return [
    { title: `Направления деятельности компании ${siteConfig.name}` },
    {
      property: "description",
      content:
        "Осуществляем монтаж систем вентиляции, дымоудаления, кондиционирования, отопления, водоснабжения, увлажнения и осушения. Выполняем проектирование инженерных систем, а также их ремонт и обслуживание. Звоните! ☎☎☎  8 (800) 301-97-63 ",
    },
  ];
};

export async function loader() {
  const services = await getServicesTree();

  return { services };
}

export default function ServicesIndex({ loaderData }: Route.ComponentProps) {
  const { services } = loaderData;
  function transformServiceToMenuItem(node: ServiceNode): MenuItemProps {
    return {
      root: node.parentId === null,
      label: node.name,
      url: `/services/${node.url}`,
      submenu:
        node.children && node.children.length > 0
          ? node.children.map((child) => transformServiceToMenuItem(child))
          : undefined,
    };
  }

  const menuItems = useMemo(() => {
    return services.map((serviceNode) =>
      transformServiceToMenuItem(serviceNode)
    );
  }, [services]);

  const rootServices = useMemo(() => {
    return services.filter((service) => service.parentId === null);
  }, [services]);

  return (
    <div className="flex-1">
      <PageHeading
        title="Направления деятельности"
        breadcrumbs={[{ label: "Направления" }]}
        className="my-6 lg:my-8"
      />

      <div className="container !px-0 lg:px-4 mx-auto mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
          <aside className="bg-card shadow rounded-lg border p-4 hidden lg:block">
            <Menu items={menuItems} />
          </aside>
          <div className="bg-card lg:shadow lg:rounded-lg border p-4 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {rootServices.map((service) => (
                <div
                  key={service.id}
                  className="flex gap-6 p-6 border hover:shadow-xl transition-shadow"
                >
                  <div className="shrink-0 size-28 rounded-full overflow-hidden">
                    <Link to={`/services/${service.url}`}>
                      <img
                        className="h-full w-full object-cover"
                        src={getImageURL(service.image?.uri || "")}
                      />
                    </Link>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg mb-2.5">
                      <Link to={`/services/${service.url}`}>
                        {service.name}
                      </Link>
                    </div>

                    <div className="text-muted-foreground text-xs">
                      {service.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
