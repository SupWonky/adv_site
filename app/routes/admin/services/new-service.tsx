import { FormProvider, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "react-router";
import { Form, useActionData, useLoaderData } from "react-router";
import { EditorConform } from "~/components/conform/editor";
import { ImagePickerConform } from "~/components/conform/image-picker";
import { InputConformWithCounter } from "~/components/conform/input";
import { TextareaConform } from "~/components/conform/textarea";
import { Field, FieldError } from "~/components/field";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { upsertService } from "~/models/service.server";
import { ServiceSchema } from "~/schema/zod";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema: ServiceSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { name, title, description, parentId, imageId, content } =
    submission.value;

  const serivce = await upsertService({
    name,
    title,
    description,
    parentId,
    imageId,
  });

  return redirect(`/services/${serivce.slug}`);
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const searchParams = new URL(request.url).searchParams;
  const parentId = searchParams.get("parentId");

  return { parentId };
};

export default function CreateServicePage() {
  const { parentId } = useLoaderData<typeof loader>();
  const lastResult = useActionData<typeof action>();
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ServiceSchema });
    },
  });

  return (
    <div className="flex flex-1 justify-center items-start">
      <Card className="w-full max-w-3xl my-12">
        <CardHeader className="text-2xl font-semibold">
          Добавить услугу
        </CardHeader>

        <CardContent>
          <FormProvider context={form.context}>
            <Form method="post" className="flex flex-col gap-y-4" id={form.id}>
              <Field>
                <Label className="text-sm font-medium">Превью</Label>

                <ImagePickerConform meta={fields.imageId} />

                {fields.imageId.errors && (
                  <FieldError>{fields.imageId.errors}</FieldError>
                )}
              </Field>

              <Field>
                <Label htmlFor={fields.name.id} className="text-sm font-medium">
                  Название
                </Label>

                <InputConformWithCounter
                  name={fields.name.name}
                  type="text"
                  maxLength={50}
                />

                {fields.name.errors && (
                  <FieldError>{fields.name.errors}</FieldError>
                )}
              </Field>

              <Field>
                <Label
                  htmlFor={fields.title.id}
                  className="text-sm font-medium"
                >
                  Заголовок
                </Label>

                <InputConformWithCounter
                  name={fields.title.name}
                  type="text"
                  maxLength={100}
                />

                {fields.title.errors && (
                  <FieldError>{fields.title.errors}</FieldError>
                )}
              </Field>

              <Field>
                <Label
                  htmlFor={fields.description.id}
                  className="text-sm font-medium"
                >
                  Описание
                </Label>

                <TextareaConform
                  className="min-h-32"
                  meta={fields.description}
                  maxLength={250}
                />

                {fields.description.errors && (
                  <FieldError>{fields.description.errors}</FieldError>
                )}
              </Field>

              <input
                className="sr-only"
                name={fields.parentId.name}
                tabIndex={-1}
                aria-hidden
                value={parentId || undefined}
                readOnly
              />

              <Field>
                <Label
                  htmlFor={fields.content.id}
                  className="text-sm font-medium"
                >
                  Контент
                </Label>

                <EditorConform className="pr-12" meta={fields.content} />

                {fields.content.errors && (
                  <FieldError>{fields.content.errors}</FieldError>
                )}
              </Field>

              <Button type="submit" className="mx-auto">
                Сохранить
              </Button>
            </Form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}
