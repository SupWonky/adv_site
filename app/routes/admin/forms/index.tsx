import { Plus } from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { getForms } from "~/models/form.server";
import { Route } from "./+types/index";

export async function loader() {
  const forms = await getForms();

  return { forms };
}

export default function FormsIndexRoute({ loaderData }: Route.ComponentProps) {
  const { forms } = loaderData;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Формы</h1>
          <p className="mt-1 text-muted-foreground">
            Управляйте вашими формами
          </p>
        </div>
        <Button asChild className="pr-6 gap-2">
          <Link to="/admin/forms/new">
            <Plus className="h-4 w-4" />
            Добавить Форму
          </Link>
        </Button>
      </div>

      <div className="mt-8">
        {forms.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg shadow">
            <p className="text-gray-500">Здесь пусто...</p>
            <Button
              className="mt-4 text-primary bg-green-100 hover:bg-green-200"
              asChild
            >
              <Link to="/admin/forms/new">Добавить первую форму</Link>
            </Button>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {forms.map((form) => (
                <li key={form.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-lg font-medium text-primary truncate">
                          {form.name}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          to={`/admin/forms/${form.id}/edit`}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Редактировать
                        </Link>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {form.description || "No description"}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          Дата: {new Date(form.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
