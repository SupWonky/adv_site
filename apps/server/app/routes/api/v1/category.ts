import { Route } from "./+types/category";
import { parseWithZod } from "@conform-to/zod";
import { ProjectCateogrySchema } from "~/schema/zod";
import { createProjectCategory } from "~/models/project.server";
import { withAuth } from "~/lib/auth-action.server";

export const action = withAuth(async ({ request }: Route.ActionArgs) => {
  const fromData = await request.formData();
  const submission = parseWithZod(fromData, { schema: ProjectCateogrySchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { name } = submission.value;

  await createProjectCategory({ name });

  return submission.reply();
});
