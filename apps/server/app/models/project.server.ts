import { File, Project, ProjectCategory } from "@prisma/client";
import { prisma } from "~/db.server";
import { formatSlug } from "~/lib/utils";

export async function getProjects(categoryId?: ProjectCategory["id"]) {
  const where = categoryId
    ? {
        ...(categoryId ? { categoryId: categoryId } : {}),
      }
    : {};

  return prisma.project.findMany({
    where,
    include: {
      images: true,
    },
  });
}

export async function getProjectById(id: Project["id"]) {
  return prisma.project.findUnique({
    where: {
      id,
    },
    include: {
      images: true,
      category: true,
    },
  });
}

export async function getPopularProjects(limit: number) {
  const groupSubmissions = await prisma.submission.groupBy({
    by: ["projectId"],
    orderBy: {
      _count: {
        projectId: "desc",
      },
    },
    take: limit,
  });

  const ids = groupSubmissions
    .map((item) => item.projectId)
    .filter((id): id is number => id !== null);

  return prisma.project.findMany({
    ...(ids.length >= limit ? { where: { id: { in: ids } } } : {}),
    include: {
      images: true,
      category: true,
    },
  });
}

export async function getProjectCategories() {
  return prisma.projectCategory.findMany();
}

export async function getProjectCategory(id: ProjectCategory["id"]) {
  return prisma.projectCategory.findFirst({
    where: {
      id,
    },
  });
}

export async function createProject({
  name,
  categoryId,
  imageIds,
}: {
  name: Project["name"];
  categoryId: Project["categoryId"];
  imageIds: { id: File["id"] }[];
}) {
  const slug = formatSlug(name);

  return prisma.project.create({
    data: {
      name,
      categoryId,
      slug,
      images: {
        connect: imageIds,
      },
    },
  });
}

export async function updateProject({
  id,
  name,
  categoryId,
  imageIds,
}: {
  id: Project["id"];
  name: Project["name"];
  categoryId: Project["categoryId"];
  imageIds: { id: File["id"] }[];
}) {
  return prisma.$transaction(async (tx) => {
    await tx.project.update({
      data: { images: { set: [] } },
      where: { id },
    });

    return tx.project.update({
      data: {
        name,
        categoryId,
        images: { connect: imageIds },
      },
      where: { id },
    });
  });
}

export async function createProjectCategory({
  name,
}: Pick<ProjectCategory, "name">) {
  const slug = formatSlug(name);

  return prisma.projectCategory.create({
    data: {
      name,
      slug,
    },
  });
}
