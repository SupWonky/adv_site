import { File, Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as cheerio from "cheerio";
import { type Element } from "domhandler";
import { formatSlug } from "~/lib/utils";
import { createId } from "@paralleldrive/cuid2";

const prisma = new PrismaClient();

const SITE_URL = "https://avante.pro";

type Service = {
  id: string;
  name: string;
  slug: string;
  title: string;
  description: string;
  path: string;
  url: string;
  imageId?: string;
  parentId?: string;
};

async function seed(): Promise<void> {
  // Delete in an order that avoids foreign key issues.
  await prisma.user.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.projectCategory.deleteMany({});
  await prisma.file.deleteMany({});

  // ─── CREATE USERS ─────────────────────────────────────────
  const johnPassword = await bcrypt.hash("johnspassword", 10);

  const jhon = await prisma.user.create({
    data: {
      email: "john@example.com",
      name: "jhon",
      password: {
        create: {
          hash: johnPassword,
        },
      },
    },
  });

  console.log("Created users:");
  console.log(` - ${jhon.email}`);

  // ─── CREATE CATEGORIES ─────────────────────────────────────────
  const $ = await cheerio.fromURL(SITE_URL);
  const listItems = $("ul.dropdown-menu:eq(1)").children("li").toArray();
  const result: Service[] = [];

  for (const elem of listItems) {
    await parseCategory($(elem), result, $);
  }

  for (const service of result) {
    await prisma.service.create({ data: service });
    console.log("Created category:");
    console.log(` - ${service.name} - ${service.parentId}`);
  }
}

async function parseCategory(
  $li: cheerio.Cheerio<Element>,
  result: Service[],
  $: cheerio.CheerioAPI,
  parent?: Service
) {
  const anchor = $li.children("a").first();
  if (!anchor.length) return null;

  const id = createId();
  const name = anchor.text().trim();

  const $page = await cheerio.fromURL(`${SITE_URL}${anchor.attr("href")}`);

  const title =
    $page("title").text().trim() ||
    $page('meta[property="og:title"]').attr("content")?.trim() ||
    "";

  // Get the meta description
  const description =
    $page('meta[name="description"]').attr("content")?.trim() ||
    $page('meta[property="og:description"]').attr("content")?.trim() ||
    "";

  const imageUrl = $page('meta[property="og:image"]').attr("content") || "";

  console.log("Title:", title);
  console.log("Description:", description);
  console.log("Image url:", imageUrl);

  const slug = formatSlug(name);
  let imageId: undefined | string = undefined;

  if (imageUrl) {
    const res = await fetch(imageUrl);
    const formData = new FormData();
    formData.append("file", await res.blob());

    const uploadRes = await fetch("http://localhost:5173/api/v1/upload", {
      method: "post",
      body: formData,
    });
    const upload = await uploadRes.json();

    imageId = upload.file.id;

    // try {
    //   image = await prisma.file.create({
    //     data: {
    //       uri: upload.file.url,
    //       type: "IMAGE",
    //     },
    //   });
    // } catch (e) {
    //   if (
    //     e instanceof Prisma.PrismaClientKnownRequestError &&
    //     e.code === "P2002"
    //   ) {
    //     image = await prisma.file.findUniqueOrThrow({
    //       where: {
    //         uri: imageUrl,
    //       },
    //     });
    //   } else {
    //     throw e;
    //   }
    // }
  }

  const service: Service = {
    id,
    path: parent ? `${parent.path}/${id}` : id,
    url: parent ? `${parent.url}/${slug}` : slug,
    name,
    slug: slug,
    parentId: parent?.id,
    title,
    description,
    imageId: imageId,
  };

  result.push(service);

  // Process nested <ul> if it exists
  const nestedUl = $li.children("ul");
  if (nestedUl.length) {
    const childItems = nestedUl.children("li").toArray();
    for (const child of childItems) {
      await parseCategory($(child), result, $, service);
    }
  }

  return service;
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
