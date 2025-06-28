import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { redirect } from "react-router";
import { Form } from "react-router";
import { ComboboxConform } from "~/components/conform/combobox";
import { ImagesPickerConform } from "~/components/conform/images-picker";
import { InputConform } from "~/components/conform/input";
import { Field, FieldError } from "~/components/field";
import { useModal } from "~/components/providers/modal-provider";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import {
  getProjectById,
  getProjectCategories,
  updateProject,
} from "~/models/project.server";
import { ProjectSchema } from "~/schema/zod";
import { Route } from "./+types/edit-project";
import { getImageURL } from "~/lib/utils";
import { withAuth } from "~/lib/auth-action.server";

export const loader = async ({ params }: Route.LoaderArgs) => {
  const project = await getProjectById(params.id);

  if (!project) {
    throw new Response("Not Found", { status: 404 });
  }

  const categories = await getProjectCategories();

  return { categories, project };
};

export const action = withAuth(
  async ({ params, request }: Route.ActionArgs) => {
    const formData = await request.formData();
    const submission = parseWithZod(formData, { schema: ProjectSchema });

    if (submission.status !== "success") {
      return submission.reply();
    }

    const { name, categoryId, images } = submission.value;

    await updateProject({ id: params.id, name, categoryId, imageIds: images });

    return redirect("/admin/projects");
  }
);

export default function EditProjectPage({ loaderData }: Route.ComponentProps) {
  const { categories, project } = loaderData;
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ProjectSchema });
    },
    defaultValue: {
      name: project.name,
      categoryId: project.categoryId,
    },
  });
  const { setModal } = useModal();

  const images = project.images.map((image) => ({
    id: image.id,
    url: getImageURL(image.uri),
    name: image.name,
  }));

  return (
    <div className="flex flex-1 justify-center items-start">
      <Card className="w-full max-w-2xl my-24">
        <CardHeader className="text-2xl font-semibold">
          Изменить проект
        </CardHeader>

        <CardContent>
          <Form method="post" className="flex flex-col gap-y-4" id={form.id}>
            <Field>
              <Label className="text-sm font-medium" htmlFor={fields.name.id}>
                Название
              </Label>
              <InputConform meta={fields.name} type="text" />
              {fields.name.errors && (
                <FieldError>{fields.name.errors}</FieldError>
              )}
            </Field>

            <Field>
              <Label
                className="text-sm font-medium"
                htmlFor={fields.categoryId.id}
              >
                Категория
              </Label>

              <ComboboxConform
                meta={fields.categoryId}
                options={categories.map((category) => ({
                  label: category.name,
                  value: category.id,
                }))}
                onAdd={() => setModal("project/category")}
              />

              {fields.categoryId.errors && (
                <FieldError>{fields.categoryId.errors}</FieldError>
              )}
            </Field>

            <Field>
              <Label className="font-medium text-sm">Изображения</Label>

              <ImagesPickerConform
                name={fields.images.name}
                initialValue={images}
              />

              {fields.images.errors && (
                <FieldError>{fields.images.errors}</FieldError>
              )}
            </Field>

            <Button type="submit" className="mx-auto">
              Сохранить
            </Button>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
