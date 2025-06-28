import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Calendar,
  Download,
  FileEdit,
  MoreHorizontal,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  getSubmissionByForm,
  getFormById,
  getSumbissionCountByForm,
} from "~/models/form.server";
import { formatRealtiveTime } from "~/lib/utils";
import { Route } from "./+types/form";
import { Pagination } from "~/components/pagination";
import { SubmissionStatus } from "@prisma/client";
import { parseWithZod } from "@conform-to/zod";
import { FormActionSchema } from "~/schema/zod";
import { prisma } from "~/db.server";
import { Form, useFetcher } from "react-router";
import { withAuth } from "~/lib/auth-action.server";

// Статусы документов с переводом
const statusTranslations = {
  ALL: "Все статусы",
  NEW: "Новый",
  REVIEWED: "Просмотрен",
  ARCHIVED: "Архивирован",
};

// Компонент бейджа статуса
const StatusBadge = ({ status }: { status: SubmissionStatus }) => {
  const variants: Record<SubmissionStatus, string> = {
    NEW: "bg-blue-100 text-blue-800 border-blue-200",
    ARCHIVED: "bg-slate-100 text-slate-800 border-slate-200",
    REVIEWED: "bg-green-100 text-green-800 border-green-200",
  };

  return (
    <Badge variant="outline" className={`${variants[status]} font-medium`}>
      {statusTranslations[status]}
    </Badge>
  );
};

export const action = withAuth(async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: FormActionSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { intent } = submission.value;

  switch (intent) {
    case "updateStatus": {
      const { status, submissionId } = submission.value;
      await prisma.submission.update({
        data: {
          status,
        },
        where: {
          id: submissionId,
        },
      });
      return {};
    }
    case "delete": {
      const { submissionId } = submission.value;
      await prisma.submission.delete({
        where: {
          id: submissionId,
        },
      });
      return {};
    }
  }
});

export async function loader({ params, request }: Route.LoaderArgs) {
  const formId = Number(params.id);
  const url = new URL(request.url);

  const status = url.searchParams.get("status") || "ALL";
  const page = Number(url.searchParams.get("page") || "1");
  const form = await getFormById(formId);

  if (!form) {
    throw new Response("Не найдено", { status: 404 });
  }

  // Получение данных с учетом серверной фильтрации
  const submissions = await getSubmissionByForm(formId);
  const totalCount = await getSumbissionCountByForm(formId);

  return {
    form,
    submissions,
    totalCount,
    filters: {
      page,
      status,
      perPage: 20,
    },
  };
}

export default function FormSubmissionsPage({
  loaderData,
}: Route.ComponentProps) {
  const { form, submissions, filters, totalCount } = loaderData;
  const fecther = useFetcher();
  const [statusFilter, setStatusFilter] = useState<string>(filters.status);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const itemsPerPage = filters.perPage;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const currentPage = filters.page;

  // Форматирование даты в "время назад"
  const formatDate = (date: Date): string => {
    return formatRealtiveTime(date);
  };

  // Получение значения поля из представления
  const getFieldValue = (fieldValues: any[], fieldId: number): string => {
    const fieldValue = fieldValues.find((fv) => fv.fieldId === fieldId);
    return fieldValue ? fieldValue.value : "-";
  };

  return (
    <div className="container my-12">
      <Card>
        <CardHeader className="border-b pb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-xl md:text-2xl font-bold">
                {form.name}
              </CardTitle>
              {form.description && (
                <CardDescription className="mt-2 text-slate-600">
                  {form.description}
                </CardDescription>
              )}
            </div>
            <Button
              variant="outline"
              className="w-full md:w-auto flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Экспорт данных (CSV)
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                }}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Фильтр по статусу" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusTranslations).map((item) => (
                    <SelectItem key={item[0]} value={item[0]}>
                      {item[1]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              <span>Всего заявок: {totalCount}</span>
            </div>
          </div>

          <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-16 cursor-pointer hover:bg-slate-100">
                      <div className="flex items-center">ID</div>
                    </TableHead>

                    {form.fields.map((field) => (
                      <TableHead
                        key={field.id}
                        className="max-w-56 cursor-pointer hover:bg-slate-100"
                      >
                        <div className="flex items-center">{field.label}</div>
                      </TableHead>
                    ))}

                    <TableHead className="cursor-pointer hover:bg-slate-100">
                      <div className="flex items-center">Статус</div>
                    </TableHead>

                    <TableHead className="cursor-pointer hover:bg-slate-100">
                      <div className="flex items-center">Дата подачи</div>
                    </TableHead>

                    <TableHead className="w-12 text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={form.fields.length + 4}
                        className="h-32 text-center text-slate-500"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-2" />
                          <p>Загрузка данных...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : submissions.length > 0 ? (
                    submissions.map((submission) => (
                      <TableRow
                        key={submission.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <TableCell className="font-medium">
                          #{submission.id}
                        </TableCell>

                        {form.fields.map((field) => (
                          <TableCell
                            key={field.id}
                            className="max-w-56"
                            title={getFieldValue(
                              submission.fieldValues,
                              field.id
                            )}
                          >
                            <div className="truncate">
                              {getFieldValue(submission.fieldValues, field.id)}
                            </div>
                          </TableCell>
                        ))}

                        <TableCell>
                          <StatusBadge status={submission.status} />
                        </TableCell>

                        <TableCell className="text-sm text-slate-600">
                          <span title={submission.createdAt.toLocaleString()}>
                            {formatDate(submission.createdAt)}
                          </span>
                        </TableCell>

                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 data-[state=open]:bg-accent"
                              >
                                <span className="sr-only">Открыть меню</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="min-w-40"
                            >
                              <DropdownMenuLabel>Действия</DropdownMenuLabel>

                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  <FileEdit className="mr-2 h-4 w-4" />
                                  Изменить статус
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                  <DropdownMenuSubContent>
                                    <Form method="post">
                                      <DropdownMenuRadioGroup
                                        value={submission.status}
                                        onValueChange={(value) => {
                                          fecther.submit(
                                            {
                                              intent: "updateStatus",
                                              submissionId: submission.id,
                                              status: value,
                                            },
                                            { method: "post" }
                                          );
                                        }}
                                      >
                                        {Object.entries(statusTranslations)
                                          .filter(([key]) => key !== "ALL")
                                          .map(([key, value]) => (
                                            <DropdownMenuRadioItem
                                              value={key}
                                              key={key}
                                              className="cursor-pointer"
                                            >
                                              {value}
                                            </DropdownMenuRadioItem>
                                          ))}
                                      </DropdownMenuRadioGroup>
                                    </Form>
                                  </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                              </DropdownMenuSub>

                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                                <Form method="post" className="w-full">
                                  <input
                                    type="hidden"
                                    name="submissionId"
                                    value={submission.id}
                                  />
                                  <button
                                    type="submit"
                                    name="intent"
                                    value="delete"
                                    className="w-full text-left flex items-center gap-2"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Удалить
                                  </button>
                                </Form>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={form.fields.length + 4}
                        className="h-32 text-center text-muted-foreground"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <p className="mb-2">Заявки не найдены</p>
                          <p className="text-sm">
                            Попробуйте изменить параметры поиска или фильтры
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-600">
              <div>
                Показано {(currentPage - 1) * itemsPerPage + 1} —{" "}
                {Math.min(currentPage * itemsPerPage, totalCount)} из{" "}
                {totalCount} записей
              </div>
              <Pagination totalPages={totalPages} currentPage={currentPage} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
