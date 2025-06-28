import { createForm } from "~/models/form.server";
import { Route } from "./+types/new-form";
import { redirect } from "react-router";
import FormBuilder from "./form-builder";
import { parseWithZod } from "@conform-to/zod";
import { FormSchema } from "~/schema/zod";
import { withAuth } from "~/lib/auth-action.server";

export const action = withAuth(async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: FormSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { name, description, fields } = submission.value;

  await createForm({
    name,
    description: description || null,
    fields,
  });

  return redirect("/admin/forms");
});

export default function NewFormRoute() {
  return (
    <div className="my-12">
      <FormBuilder />
    </div>
  );
}
