import { getFormById, updateForm } from "~/models/form.server";
import { Route } from "./+types/edit-form";
import FormBuilder from "./form-builder";
import { parseWithZod } from "@conform-to/zod";
import { FormSchema } from "~/schema/zod";
import { redirect } from "react-router";
import { withAuth } from "~/lib/auth-action.server";

export async function loader({ params }: Route.LoaderArgs) {
  const form = await getFormById(Number(params.id));

  if (!form) {
    throw new Response("Not Found", { status: 404 });
  }

  return { form };
}

export const action = withAuth(
  async ({ request, params }: Route.ActionArgs) => {
    const formData = await request.formData();
    const submission = parseWithZod(formData, { schema: FormSchema });

    if (submission.status !== "success") {
      return submission.reply();
    }

    const id = Number(params.id);
    const { name, description, fields } = submission.value;

    await updateForm({ id, name, description: description || null, fields });

    return redirect("/admin/forms");
  }
);

export default function EditFormPage({ loaderData }: Route.ComponentProps) {
  const { form } = loaderData;
  const defaultValues = {
    name: form.name,
    description: form.description || undefined,
    fields: form.fields,
  };

  return (
    <div className="my-12">
      <FormBuilder formId={form.id} defaultValues={defaultValues} />
    </div>
  );
}
