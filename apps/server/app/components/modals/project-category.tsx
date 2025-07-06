import { useFetcher } from "react-router";
import { DialogHeader, DialogTitle } from "../ui/dialog";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { ProjectCateogrySchema } from "~/schema/zod";
import { Field, FieldError } from "../field";
import { Label } from "../ui/label";
import { InputConform } from "../conform/input";
import { Button } from "../ui/button";
import { useEffect } from "react";
import { Route } from "../../routes/api/v1/+types/category";
import { useModal } from "../providers/modal-provider";

export function ProjectCateogryDialog() {
  const fetcher = useFetcher<Route.ComponentProps["actionData"]>();
  const [form, fields] = useForm({
    lastResult: fetcher.state === "idle" ? fetcher.data : undefined,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ProjectCateogrySchema });
    },
  });
  const { closeModal } = useModal();

  useEffect(() => {
    if (fetcher.data) {
      const result = fetcher.data;

      if (result.status === "success") {
        closeModal();
      }
    }
  }, [fetcher.data]);

  return (
    <div className="grid items-start justify-center grid-cols-[minmax(0,320px)] grid-rows-[auto,auto,1fr] min-h-96">
      <DialogHeader className="mb-8 items-center">
        <DialogTitle className="mt-8 text-2xl font-medium">
          Категория
        </DialogTitle>
      </DialogHeader>

      <fetcher.Form
        id={form.id}
        method="post"
        action="/api/v1/category"
        className="space-y-8"
      >
        <Field>
          <Label className="font-medium text-sm" htmlFor={fields.name.id}>
            Название
          </Label>

          <InputConform meta={fields.name} type="text" />

          {fields.name.errors && <FieldError>{fields.name.errors}</FieldError>}
        </Field>

        <Button className="w-full" type="submit">
          Сохранить
        </Button>
      </fetcher.Form>
    </div>
  );
}
