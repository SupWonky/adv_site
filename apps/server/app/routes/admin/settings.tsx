import { useFetcher } from "react-router";
import { z } from "zod";
import { settingService } from "~/models/setting.server";
import { Route } from "./+types/settings";
import { JsonValue } from "@prisma/client/runtime/library";
import { useEffect, useState } from "react";
import { FormProvider, useForm, useFormMetadata } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { getFieldsetProps } from "@conform-to/react";
import { Button } from "~/components/ui/button";
import { Field, FieldError } from "~/components/field";
import { CheckboxConform } from "~/components/conform/checkbox";
import { Label } from "~/components/ui/label";
import { InputConform } from "~/components/conform/input";
import { Cross1Icon, PlusIcon } from "@radix-ui/react-icons";
import { siteConfig } from "~/config/site";

export const SETTINGS_REGISTRY = {
  social: {
    schema: z.object({
      socials: z.array(
        z.object({
          name: z.string().describe("Название"),
          url: z.string().url().describe("Ссылка"),
          logo: z.string().describe("Логотип"),
        })
      ),
    }),
    label: "Соц. Сети",
    description: "Настройте ваши соц. сети",
  },
  info: {
    schema: z.object({
      phone: z.number().describe("Телефон"),
      email: z.string().email().describe("Почта"),
      address: z.string().describe("Адрес"),
      description: z.string().describe("Описание"),
    }),
    label: "Основная информация",
    description: "Настройте основную информацию",
  },
};

export const meta: Route.MetaFunction = () => {
  return [{ title: `Настройки - ${siteConfig.name}` }];
};

export async function loader() {
  const settings = await settingService.getSettings();
  return { settings };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const settingKey = formData.get(
    "settingKey"
  ) as keyof typeof SETTINGS_REGISTRY;
  const config = SETTINGS_REGISTRY[settingKey];

  if (!config) {
    return { success: false, error: "Invalid setting key" };
  }

  const submission = parseWithZod(formData, { schema: config.schema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  await settingService.updateSetting(
    settingKey,
    JSON.stringify(submission.value)
  );

  return submission.reply();
}

export default function SettingsPage({ loaderData }: Route.ComponentProps) {
  const { settings } = loaderData;
  const settingsMap = new Map(
    settings.map((setting) => [setting.key, setting.value])
  );

  return (
    <div className="my-12 mx-auto w-full flex-1 min-h-screen max-w-screen-lg lg:rounded-xl border lg:shadow bg-card overflow-hidden">
      <div className="p-4 lg:p-6 border-b">
        <h1 className="text-2xl font-semibold">Настройки</h1>
      </div>

      {Object.entries(SETTINGS_REGISTRY).map(([key, config]) => (
        <SettingSection
          key={key}
          settingKey={key}
          config={config}
          value={settingsMap.get(key)}
        />
      ))}
    </div>
  );
}

interface SettingSectionProps {
  settingKey: string;
  config: (typeof SETTINGS_REGISTRY)[keyof typeof SETTINGS_REGISTRY];
  value?: JsonValue;
}

function SettingSection({ settingKey, config, value }: SettingSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const fetcher = useFetcher();
  const { schema, label, description } = config;
  const [form, fields] = useForm({
    lastResult: fetcher.state === "idle" ? fetcher.data : undefined,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    defaultValue: value ? JSON.parse(value as string) : undefined,
  });

  const isSubmitting = fetcher.state === "submitting";

  const handleCancel = () => {
    setIsEditing(false);
  };

  useEffect(() => {
    if (form.status === "success") {
      setIsEditing(false);
    }
  }, [fetcher.data, form.status]);

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg leading-8 font-medium">{label}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {!isEditing && (
          <Button size="sm" onClick={() => setIsEditing(true)} type="button">
            Редактировать
          </Button>
        )}
      </div>

      <FormProvider context={form.context}>
        <fetcher.Form id={form.id} method="post">
          <input type="hidden" name="settingKey" value={settingKey} />
          <SchemaFormRenderer
            schema={schema}
            fields={fields}
            disabled={!isEditing}
            formId={form.id}
          />

          {isEditing && (
            <div className="flex justify-center gap-2 mt-4">
              <Button size="lg" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Сохранение..." : "Сохранить"}
              </Button>
              <Button
                size="lg"
                variant="destructive"
                onClick={handleCancel}
                type="button"
              >
                Отмена
              </Button>
            </div>
          )}
        </fetcher.Form>
      </FormProvider>
    </div>
  );
}

interface SchemaFormRendererProps {
  schema: z.ZodSchema;
  fields: any;
  formId: string;
  name?: string;
  disabled?: boolean;
}

function SchemaFormRenderer({
  schema,
  fields,
  name = "",
  disabled = false,
  formId,
}: SchemaFormRendererProps) {
  const fieldType = getFieldType(schema);

  switch (fieldType) {
    case "object": {
      return (
        <ObjectFieldRenderer
          schema={schema}
          fields={fields}
          name={name}
          disabled={disabled}
          fromId={formId}
        />
      );
    }
    case "array": {
      return (
        <ArrayFieldRenderer
          schema={schema}
          fields={fields}
          name={name}
          formId={formId}
        />
      );
    }
    case "string": {
      return <InputConform meta={fields[name]} type="text" />;
    }
    case "number": {
      return <InputConform meta={fields[name]} type="number" />;
    }
    case "boolean": {
      return <CheckboxConform meta={fields[name]} />;
    }
    default: {
      return <div>Unsupported field type: {fieldType}</div>;
    }
  }
}

interface ObjectFieldRendererProps {
  schema: z.ZodSchema;
  fields: any;
  fromId: string;
  name?: string;
  disabled?: boolean;
}

function ObjectFieldRenderer({
  schema,
  fields,
  fromId,
  name = "",
  disabled = false,
}: ObjectFieldRendererProps) {
  const objectSchema = schema as z.ZodObject<any>;
  const shape = objectSchema.shape;

  return (
    <fieldset {...getFieldsetProps(fields[name] || fields)} disabled={disabled}>
      <div className="space-y-4">
        {Object.entries(shape).map(([key, fieldSchema]) => {
          const zodField = fieldSchema as z.ZodSchema<any>;
          const label = zodField._def.description;

          return (
            <Field key={key}>
              <Label className="font-medium text-sm">{label}</Label>

              <SchemaFormRenderer
                schema={fieldSchema as z.ZodSchema}
                fields={fields}
                name={key}
                formId={fromId}
              />

              {fields[key].errors && (
                <FieldError>{fields[key].errors}</FieldError>
              )}
            </Field>
          );
        })}
      </div>
    </fieldset>
  );
}

interface ArrayFieldRendererProps {
  schema: z.ZodSchema;
  fields: any;
  formId: string;
  name: string;
}

function ArrayFieldRenderer({
  schema,
  fields,
  formId,
  name,
}: ArrayFieldRendererProps) {
  const form = useFormMetadata(formId);
  const arraySchema = schema as z.ZodArray<any>;
  const elementSchema = arraySchema.element;
  const items = fields[name].getFieldList();

  return (
    <div className="space-y-4">
      {items.map((item: any, index: number) => {
        const itemName = `${name}.${index}`;
        const itemFields = item.getFieldset();

        return (
          <div key={itemName} className="border rounded-md p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Элемент {index + 1}</h4>
              <Button
                size="icon"
                variant="destructive"
                {...form.remove.getButtonProps({
                  name,
                  index,
                })}
                className="h-8 w-8"
              >
                <Cross1Icon className="size-5" />
              </Button>
            </div>

            <SchemaFormRenderer
              schema={elementSchema}
              fields={itemFields}
              formId={formId}
            />
          </div>
        );
      })}

      <button
        className="w-full p-4 border bg-muted/50 hover:bg-accent flex items-center justify-center rounded-md hover:text-primary hover:border-primary transition-all duration-200 border-dashed disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none"
        {...form.insert.getButtonProps({
          name: fields[name].name,
        })}
      >
        <PlusIcon className="size-5" />
      </button>
    </div>
  );
}

function getFieldType(schema: z.ZodSchema): string {
  if (schema instanceof z.ZodString || schema instanceof z.ZodEnum) {
    return "string";
  }
  if (schema instanceof z.ZodObject) return "object";
  if (schema instanceof z.ZodBoolean) return "boolean";
  if (schema instanceof z.ZodArray) return "array";
  if (schema instanceof z.ZodNumber) return "number";
  return "unknown";
}
