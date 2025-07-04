import {
  data,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import type { LinksFunction, LoaderFunctionArgs } from "react-router";

import "./tailwind.css";
import { createGuestSession, getSessionId, getUser } from "./session.server";
import { ModalProvider } from "./components/providers/modal-provider";
import { ModalRouter } from "./components/modals/router";
import { ModalRoute } from "./components/modals/route";
import { ProjectCateogryDialog } from "./components/modals/project-category";
import { CallFormDialog } from "./components/modals/call-form";
import { Toaster } from "./components/ui/sonner";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  const session = await getSessionId(request);

  if (!session) {
    const cookie = await createGuestSession(request);
    return data({ user }, { headers: { "Set-Cookie": cookie } });
  }

  return { user };
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-svh bg-muted dark:bg-background font-sans antialiased flex flex-col">
        <ModalProvider>
          {children}

          <ModalRouter>
            <ModalRoute
              path="project/category"
              component={<ProjectCateogryDialog />}
            />
            <ModalRoute path="call" component={<CallFormDialog />} />
          </ModalRouter>
        </ModalProvider>

        <ScrollRestoration />
        <Scripts />
        <Toaster />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
