import { Form as RemixForm, useActionData, useNavigation } from "react-router";
import { Field, FieldError } from "~/components/field";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { FormSchema } from "~/schema/zod";
import { InputConform } from "~/components/conform/input";
import { TextareaConform } from "~/components/conform/textarea";
import { CheckboxConform } from "~/components/conform/checkbox";
import { Route } from "./+types/new-form";
import { SelectConform } from "~/components/conform/select";

type FormBuilderProps = {
  formId?: number;
  defaultValues?: {
    name: string;
    description?: string;
    fields: Array<{
      name: string;
      label: string;
      type: string;
      required: boolean;
      //order: number;
      options?: string[];
    }>;
  };
};

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "number", label: "Number" },
  { value: "textarea", label: "Text Area" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
  { value: "radio", label: "Radio Buttons" },
  { value: "date", label: "Date" },
  { value: "tel", label: "Phone" },
  { value: "file", label: "File Upload" },
];

export default function FormBuilder({
  formId,
  defaultValues,
}: FormBuilderProps) {
  const lastResult = useActionData<Route.ComponentProps["actionData"]>();
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: FormSchema });
    },
    defaultValue: defaultValues,
  });
  const formFields = fields.fields.getFieldList();

  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // Helper to generate field names that are URL-safe
  // const generateFieldName = (label: string, index: number) => {
  //   if (!label) return `field_${index}`;
  //   return label
  //     .toLowerCase()
  //     .replace(/[^a-z0-9]/g, "_")
  //     .replace(/_+/g, "_")
  //     .replace(/^_|_$/g, "");
  // };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">
          {formId ? "Редактировать форму" : "Создать форму"}
        </CardTitle>
        {form.errors && (
          <CardDescription className="text-destructive">
            {form.errors}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent>
        <RemixForm id={form.id} method="post">
          {formId && <input type="hidden" name="formId" value={formId} />}

          <div className="space-y-4">
            <Field>
              <Label htmlFor={fields.name.id} className="text-sm font-medium">
                Название формы
              </Label>
              <InputConform type="text" meta={fields.name} />
              {fields.name.errors && (
                <FieldError>{fields.name.errors}</FieldError>
              )}
            </Field>

            <Field>
              <Label
                htmlFor={fields.description.id}
                className="text-sm font-medium"
              >
                Описание
              </Label>
              <TextareaConform meta={fields.description} rows={2} />
              {fields.description.errors && (
                <FieldError>{fields.description.errors}</FieldError>
              )}
            </Field>
          </div>

          <div className="flex flex-col gap-1 mt-4">
            <label className="text-sm font-medium">Поля формы</label>

            <div className="space-y-4">
              {formFields.map((field, index) => {
                const { type, label, name, required } = field.getFieldset();
                return (
                  <div key={field.key} className="p-4 border rounded-md">
                    <div className="flex justify-between mb-3">
                      <h4 className="text-base font-medium">
                        Поле #{index + 1}
                      </h4>

                      <div className="flex space-x-2">
                        <button
                          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                          disabled={index === 0}
                          {...form.reorder.getButtonProps({
                            name: fields.fields.name,
                            from: index,
                            to: index - 1,
                          })}
                        >
                          ↑
                        </button>
                        <button
                          disabled={index === formFields.length - 1}
                          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                          {...form.reorder.getButtonProps({
                            name: fields.fields.name,
                            from: index,
                            to: index + 1,
                          })}
                        >
                          ↓
                        </button>

                        <button
                          className="p-1 text-red-600 hover:text-red-800"
                          {...form.remove.getButtonProps({
                            name: fields.fields.name,
                            index,
                          })}
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field>
                        <Label
                          htmlFor={label.id}
                          className="text-sm font-medium"
                        >
                          Метка
                        </Label>
                        <InputConform type="text" meta={label} />

                        {label.errors && (
                          <FieldError>{label.errors}</FieldError>
                        )}
                      </Field>

                      <Field>
                        <Label
                          htmlFor={name.id}
                          className="text-sm font-medium"
                        >
                          Имя поля
                        </Label>
                        <InputConform type="text" meta={name} />

                        {name.errors && <FieldError>{name.errors}</FieldError>}
                      </Field>

                      <Field>
                        <Label className="text-sm font-medium">Тип поля</Label>

                        <SelectConform
                          meta={type}
                          placeholder="Выберите тип поля"
                          items={FIELD_TYPES.map((type) => ({
                            value: type.value,
                            name: type.label,
                          }))}
                        />

                        {type.errors && <FieldError>{type.errors}</FieldError>}
                      </Field>

                      <div className="flex items-center mt-4 justify-center gap-2">
                        <CheckboxConform meta={required} />
                        <Label
                          htmlFor={required.id}
                          className="text-sm font-medium"
                        >
                          Обязательное поле
                        </Label>
                      </div>
                    </div>
                  </div>
                );
              })}

              <Button
                className="flex py-6 items-center justify-center w-full bg-muted/50 hover:text-primary hover:border-primary border-2 border-dashed duration-200 transition-colors"
                variant="ghost"
                {...form.insert.getButtonProps({
                  name: fields.fields.name,
                })}
              >
                <Plus className="size-5" />
              </Button>
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-12"
              size="lg"
            >
              {formId ? "Изменить" : "Добавить"}
            </Button>
          </div>
        </RemixForm>
      </CardContent>
    </Card>
  );
}
