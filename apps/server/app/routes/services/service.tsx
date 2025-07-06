import { useLoaderData } from "react-router";
import {
  getServiceBySlug,
  getServicesTree,
  getServiceTree,
  ServiceNode,
} from "~/models/service.server";
import { PageHeading } from "../../components/heading";
import { Menu, MenuItemProps } from "./menu";
import { Route } from "./+types/service";
import { getImageURL } from "~/lib/utils";
import { RichText } from "~/components/editor/richText";
import { useMemo } from "react";

export const loader = async ({ params }: Route.LoaderArgs) => {
  const { "*": splat } = params;
  const parts = splat.split("/");
  const slug = parts[parts.length - 1];

  const service = await getServiceBySlug(slug);

  if (!service) {
    throw new Response(null, { status: 404, statusText: "Not Found" });
  }

  const serviceTree = await getServiceTree({ path: service.path });
  const services = await getServicesTree();

  return { service, serviceTree, services };
};

export const meta = ({ data }: Route.MetaArgs): Route.MetaDescriptors => {
  const { service } = data;
  return [
    { title: service.title },
    { name: "description", content: service.description },
    { propetry: "og:title", content: service.title },
    { propetry: "og:description", content: service.description },
    service.image
      ? { property: "og:image", content: getImageURL(service.image?.uri) }
      : {},
  ];
};

export default function ServicePage() {
  const { service, serviceTree, services } = useLoaderData<typeof loader>();

  const pathParts = service.path.split("/");

  function transformServiceToMenuItem(node: ServiceNode): MenuItemProps {
    return {
      root: node.parentId === null,
      label: node.name,
      url: `/services/${node.url}`,
      active: pathParts.includes(node.id),
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

  return (
    <div className="flex-1">
      <PageHeading
        title={service.name}
        breadcrumbs={serviceTree.map((item) => ({
          label: item.name,
          url: `/services/${item.url}`,
        }))}
        className="my-6 lg:my-8"
      />

      <div className="container !px-0 lg:px-4 mx-auto mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          <aside className="bg-card shadow rounded-lg border p-4 hidden lg:block">
            <Menu items={menuItems} />
          </aside>
          <div className="bg-card lg:shadow lg:rounded-lg border px-4 lg:px-6 py-4">
            <RichText
              // @ts-ignore
              content={JSON.parse(service.content)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
