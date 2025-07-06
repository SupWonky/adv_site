import { z } from "zod";
import { prisma } from "~/db.server";

export async function getSetting<T>(key: string, schema: z.ZodSchema<T>) {
  const setting = await prisma.setting.findUnique({
    where: {
      key,
    },
  });

  if (!setting) {
    return null;
  }

  try {
    const value = JSON.parse(setting.value as string);
    return schema.parse(value);
  } catch (err) {
    console.error(`Invalid setting format for ${key}`, err);
    return null;
  }
}

export async function getSettings() {
  return prisma.setting.findMany();
}

export async function updateSetting(key: string, value: string) {
  return prisma.setting.upsert({
    create: {
      key,
      value,
    },
    update: {
      value,
    },
    where: {
      key,
    },
  });
}
