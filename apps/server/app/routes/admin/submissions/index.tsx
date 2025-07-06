import { getForms } from "~/models/form.server";
import { Route } from "./+types/index";
import { Link } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  const forms = await getForms();

  return { forms };
}

export default function SubmissionsIndexRoute({
  loaderData,
}: Route.ComponentProps) {
  const { forms } = loaderData;

  return (
    <div className="py-6 container flex-1 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Заявки по формам</h1>
      </div>

      <div className="bg-card shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {forms.map((form) => (
            <li key={form.id}>
              <Link
                to={`/admin/submissions/form/${form.id}`}
                className="block hover:bg-gray-50"
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-medium text-primary truncate">
                      {form.name}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      {form.description && (
                        <p className="flex items-center text-sm text-muted-foreground">
                          {form.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
