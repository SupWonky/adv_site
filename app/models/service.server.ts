import { createId } from "@paralleldrive/cuid2";
import { Service } from "@prisma/client";
import { prisma } from "~/db.server";
import { formatSlug } from "~/lib/utils";

export async function getServicesTree() {
  const allServices = await prisma.service.findMany({
    orderBy: { path: "asc" },
    where: {
      status: { equals: "PUBLISHED" },
    },
  });

  return buildTree(allServices);
}

export type ServiceNode = Service & { children: ServiceNode[] };

function buildTree(services: Service[]): ServiceNode[] {
  const map = new Map<string, ServiceNode>();
  const roots: ServiceNode[] = [];

  services.forEach((service) => {
    map.set(service.id, { ...service, children: [] });
  });

  map.forEach((service) => {
    if (service.parentId) {
      const parent = map.get(service.parentId);
      parent?.children.push(service);
    } else {
      roots.push(service);
    }
  });

  return roots;
}

export async function upsertService({
  id,
  title,
  name,
  description,
  parentId,
  imageId,
  content,
}: {
  id?: Service["id"];
  description: Service["description"];
  title: Service["title"];
  name: Service["name"];
  parentId?: Service["parentId"];
  imageId: Service["imageId"];
  content?: Service["content"];
}) {
  const slug = formatSlug(name);

  const serviceId = id || createId();
  let path = "";
  let url = "";

  if (parentId) {
    const parent = await prisma.service.findUniqueOrThrow({
      select: { path: true, url: true },
      where: {
        id: parentId,
      },
    });

    path = `${parent.path}/${serviceId}`;
    url = `${parent.url}/${slug}`;
  } else {
    path = `${serviceId}`;
    url = `${slug}`;
  }

  return prisma.service.upsert({
    create: {
      id: serviceId,
      title,
      name,
      slug,
      parentId,
      path,
      description,
      url,
      imageId,
      content: content || undefined,
    },
    update: {
      title,
      name,
      slug,
      parentId,
      path,
      description,
      url,
      imageId,
      content: content || undefined,
    },
    where: {
      id: serviceId,
    },
  });
}

export async function getServiceBySlug(slug: Service["slug"]) {
  return prisma.service.findUnique({
    where: {
      slug,
    },
    include: {
      image: true,
    },
  });
}

export async function getServiceById(id: Service["id"]) {
  return prisma.service.findUnique({
    where: {
      id,
    },
    include: {
      image: true,
    },
  });
}

export async function getServiceTree({ path }: { path: Service["path"] }) {
  const pathParts = path.split("/");
  return prisma.service.findMany({
    where: {
      id: { in: pathParts },
    },
    orderBy: { path: "asc" },
  });
}

export async function getServiceList() {
  return prisma.service.findMany({
    include: {
      image: true,
    },
  });
}

export async function getPopularServices(limit: number) {
  const groupSubmissions = await prisma.submission.groupBy({
    by: ["serviceId"],
    orderBy: {
      _count: {
        serviceId: "desc",
      },
    },
    take: limit,
  });

  const ids = groupSubmissions
    .map((item) => item.serviceId)
    .filter((id): id is string => id !== null);

  return prisma.service.findMany({
    ...(ids.length >= limit
      ? {
          where: {
            id: { in: ids },
          },
        }
      : {}),
    include: {
      image: true,
    },
  });
}

export async function deleteService(id: Service["id"]) {
  return prisma.service.delete({
    where: {
      id,
    },
  });
}

export async function updateServiceStatus(
  id: Service["id"],
  status: Service["status"]
) {
  return prisma.service.updateMany({
    data: {
      status,
    },
    where: {
      path: { startsWith: `%${id}` },
    },
  });
}
