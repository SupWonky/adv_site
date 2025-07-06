import { SubmissionStatus } from "@prisma/client";
import { z } from "zod";

const ServiceSchema = z.object({
  name: z
    .string({ message: "Введите навзание" })
    .max(60, "Превышен лимит символов"),
  title: z
    .string({ message: "Введите заголовок" })
    .max(100, "Превышен лимит символов"),
  description: z
    .string({ message: "Введите описание" })
    .max(250, "Превышен лимит символов"),
  content: z.string({ message: "Введите контент" }),
  parentId: z.string().optional(),
  imageId: z.string({ message: "Добавитье изображение" }),
});

const ProjectSchema = z.object({
  name: z
    .string({ message: "Введите навзание" })
    .max(60, "Превышен лимит символов"),
  categoryId: z.string({ message: "Выберите категорию проекта" }),
  images: z.preprocess(
    (val) => {
      try {
        return typeof val === "string" ? JSON.parse(val) : val;
      } catch {
        return val;
      }
    },
    z.array(
      z.object({
        id: z.string(),
      })
    )
  ),
});

const ProjectCateogrySchema = z.object({
  name: z
    .string({ message: "Введите навзание" })
    .max(60, "Превышен лимит символов"),
});

const MessageSchema = z.object({
  text: z.string({ message: "Введите сообщение" }).max(300),
  chatId: z.number({ message: "Ошибка, не указан чат" }).optional(),
});

const CallSchema = z.object({
  fio: z.string({ message: "Введите имя" }).max(100),
  phone: z.string({ message: "Введите номер телефона" }),
});

const FormSchema = z.object({
  name: z.string({ message: "Введите навзание формы" }),
  description: z.string().optional(),
  fields: z
    .array(
      z.object({
        label: z.string({ message: "Введите метку поля" }),
        name: z.string({ message: "Введите назавние поля" }),
        type: z.string({ message: "Введите тип поля" }),
        required: z.boolean().optional(),
      })
    )
    .min(1, { message: "Добавьте как минимум одно поле" }),
});

const FormActionSchema = z.discriminatedUnion("intent", [
  z.object({
    intent: z.literal("updateStatus"),
    status: z.nativeEnum(SubmissionStatus),
    submissionId: z.number(),
  }),
  z.object({
    intent: z.literal("delete"),
    submissionId: z.number(),
  }),
]);

export {
  ServiceSchema,
  MessageSchema,
  ProjectSchema,
  ProjectCateogrySchema,
  CallSchema,
  FormSchema,
  FormActionSchema,
};
