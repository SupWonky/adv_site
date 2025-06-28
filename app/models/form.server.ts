import { FieldValue, Form, FormField, Submission } from "@prisma/client";
import { prisma } from "~/db.server";
import { formatSlug } from "~/lib/utils";

export async function createForm({
  name,
  description,
  fields,
}: Pick<Form, "name" | "description"> & {
  fields: Pick<FormField, "name" | "label" | "type">[];
}) {
  const slug = formatSlug(name);

  return prisma.form.create({
    data: {
      name,
      description,
      slug,
      fields: {
        createMany: {
          data: fields,
        },
      },
    },
  });
}

export async function updateForm({
  id,
  name,
  description,
  fields,
}: Pick<Form, "id" | "name" | "description"> & {
  fields: Pick<FormField, "name" | "label" | "type">[];
}) {
  const slug = formatSlug(name);
  console.log(fields);

  return prisma.$transaction([
    prisma.form.update({ data: { fields: { deleteMany: {} } }, where: { id } }),
    prisma.form.update({
      data: {
        name,
        description,
        slug,
        fields: { createMany: { data: fields } },
      },
      where: { id },
    }),
  ]);
}

export async function getForms() {
  return prisma.form.findMany();
}

export async function getFormById(id: Form["id"]) {
  return prisma.form.findUnique({
    where: {
      id,
    },
    include: {
      fields: true,
    },
  });
}

export async function getFormBySlug(slug: Form["slug"]) {
  return prisma.form.findFirst({
    where: {
      slug,
    },
    include: {
      fields: true,
    },
  });
}

export async function getSubmissionById(id: Submission["id"]) {
  return prisma.submission.findUnique({
    where: { id },
    include: {
      form: true,
      fieldValues: {
        include: {
          field: true,
        },
      },
      service: true,
      project: true,
    },
  });
}

export async function getSubmissionByForm(formId: Form["id"]) {
  return prisma.submission.findMany({
    where: {
      formId,
    },
    include: {
      fieldValues: true,
    },
  });
}

export async function getSumbissionCountByForm(formId: Form["id"]) {
  return prisma.submission.count({
    where: {
      formId,
    },
  });
}

export async function createFormSubmission({
  formId,
  fieldValues,
}: {
  formId: Form["id"];
  fieldValues: Pick<FieldValue, "value" | "fieldId">[];
}) {
  return prisma.submission.create({
    data: {
      formId,
      fieldValues: {
        create: fieldValues,
      },
    },
  });
}

export async function updateSubmissionStatus(
  id: Submission["id"],
  status: Submission["status"]
) {
  return prisma.submission.update({
    where: { id },
    data: { status },
  });
}

export async function deleteSubmission(id: Submission["id"]) {
  return prisma.submission.delete({
    where: { id },
  });
}
