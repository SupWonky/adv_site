import { useEffect, useState } from "react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useFetcher } from "react-router";
import { CallSchema } from "~/schema/zod";
import { DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Field, FieldError } from "../field";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Route } from "../../routes/api/v1/+types/form";
import { InputConform, InputPhoneConform } from "../conform/input";
import { useModal } from "../providers/modal-provider";
import { toast } from "sonner";

export function CallFormDialog() {
  const fetcher = useFetcher<Route.ComponentProps["actionData"]>();
  const [form, fields] = useForm({
    lastResult: fetcher.state === "idle" ? fetcher.data : undefined,
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: CallSchema });
    },
  });
  const { closeModal } = useModal();

  const isLoading = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.data) {
      const result = fetcher.data;

      if (result.status === "success") {
        closeModal();
        toast.success("Обращение отправленно", {
          closeButton: true,
          position: "bottom-left",
        });
      }
    }
  }, [fetcher.data]);

  return (
    <div className="grid items-start justify-center grid-cols-[minmax(0,320px)] grid-rows-[auto,auto,1fr] min-h-96">
      <DialogHeader className="mb-8 items-center">
        <DialogTitle className="mt-8 text-2xl font-medium">
          Заказать звонок
        </DialogTitle>
        {form.errors && (
          <DialogDescription className="mt-1 text-sm text-red-500">
            {form.errors}
          </DialogDescription>
        )}
      </DialogHeader>

      <fetcher.Form
        id={form.id}
        className="space-y-4"
        method="post"
        action="/api/v1/form/1"
      >
        <Field>
          <Label htmlFor={fields.fio.id} className="text-sm font-medium">
            Имя
          </Label>

          <InputConform meta={fields.fio} type="text" placeholder="Имя..." />

          {fields.fio.errors && <FieldError>{fields.fio.errors}</FieldError>}
        </Field>

        <Field>
          <Label htmlFor={fields.phone.id} className="text-sm font-medium">
            Телефон
          </Label>

          <InputPhoneConform meta={fields.phone} />

          {fields.phone.errors && (
            <FieldError>{fields.phone.errors}</FieldError>
          )}
        </Field>

        <Button className="w-full mt-4" disabled={isLoading}>
          {isLoading ? "Отправляю..." : "Отправить"}
        </Button>
      </fetcher.Form>
    </div>
  );
}
