import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { prisma } from "~/db.server";
import { Cache, invalidateCacheKeys, invalidateCacheTags } from "~/lib/cache";

class SettingService {
  constructor(private readonly prismaSetting: PrismaClient["setting"]) {}

  @Cache({ keyGenerator: (key) => `${key}` })
  async getSetting<T>(key: string, schema: z.ZodSchema<T>) {
    const setting = await this.prismaSetting.findUnique({
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

  @Cache({ tags: ["settings"] })
  async getSettings() {
    return this.prismaSetting.findMany();
  }

  async updateSetting(key: string, value: string) {
    invalidateCacheTags(["settings"]);
    invalidateCacheKeys([key]);

    return this.prismaSetting.upsert({
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
}

const settingService = new SettingService(prisma.setting);

export { settingService };
