import { createId } from "@paralleldrive/cuid2";
import { File } from "@prisma/client";
import { prisma } from "~/db.server";

export async function createFile({ name, type }: Pick<File, "name" | "type">) {
  const id = createId();

  return prisma.file.create({
    data: { id, name, type, uri: `${id}-${name}` },
  });
}

export async function getFileByUri(uri: string) {
  return prisma.file.findUnique({
    where: {
      uri,
    },
  });
}
