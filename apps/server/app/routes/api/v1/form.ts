import { createFormSubmission, getFormById } from "~/models/form.server";
import { Route } from "./+types/form";
import { FormField } from "@prisma/client";
import { z } from "zod";
import { parseWithZod } from "@conform-to/zod";
import { parsePhoneNumberFromString } from "libphonenumber-js";

export async function loader({ params }: Route.LoaderArgs) {
  const form = await getFormById(Number(params.id));

  if (!form) {
    throw new Response("Not Found", { status: 404 });
  }

  return { form };
}

export async function action({ params, request }: Route.ActionArgs) {
  const form = await getFormById(Number(params.id));

  if (!form) {
    throw new Response("Not Found", { status: 404 });
  }

  const formData = await request.formData();
  const schema = generateZodSchema(form.fields);
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const result = Object.entries(submission.value);

  await createFormSubmission({
    formId: form.id,
    fieldValues: result.map((item) => ({
      value: item[1],
      fieldId: Number(form.fields.find((field) => field.name === item[0])?.id),
    })),
  });

  return submission.reply();
}

function generateZodSchema(fields: FormField[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    let fieldSchema: z.ZodTypeAny;

    switch (field.type) {
      case "text":
        fieldSchema = z.string({
          required_error: `${field.label} обязательное поле`,
          invalid_type_error: `${field.label} должен быть строкой`,
        });
        break;

      case "tel":
        fieldSchema = z
          .string({
            required_error: `${field.label} обязательное поле`,
            invalid_type_error: `${field.label} должен быть строкой`,
          })
          .pipe(
            z.string().superRefine((phone, ctx) => {
              const result = parsePhoneNumberFromString(phone, "RU");
              if (!result?.isValid()) {
                ctx.addIssue({
                  code: "custom",
                  message: "Неверный номер телефона",
                  fatal: true,
                });
              }
            })
          );
        break;

      case "number":
        fieldSchema = z.number({
          required_error: `${field.label} обязательное поле`,
          invalid_type_error: `${field.label} должен быть числом`,
        });
        break;

      case "email":
        fieldSchema = z
          .string({
            required_error: `${field.label} обязательное поле`,
            invalid_type_error: `${field.label} должен быть строкой`,
          })
          .email(`${field.label} должен быть корректным адресом почты`);
        break;

      case "date":
        fieldSchema = z.date({
          required_error: `${field.label} обязательное поле`,
          invalid_type_error: `${field.label} должен быть корректной датой`,
        });
        break;

      case "boolean":
        fieldSchema = z.boolean({
          required_error: `${field.label} обязательное поле`,
        });
        break;

      default:
        fieldSchema = z.any();
    }

    // Handle optional fields
    if (!field.required) {
      fieldSchema = fieldSchema.optional();
    }

    shape[field.name] = fieldSchema;
  }

  return z.object(shape);
}
