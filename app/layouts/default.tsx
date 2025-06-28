import React from "react";
import { LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData } from "react-router";
import { FloatingChat } from "~/components/floating-chat";
import { Footer } from "~/components/footer";
import { SiteHeader } from "~/components/header";
import { getChatBySession } from "~/models/chat.server";
import { getProjectCategories } from "~/models/project.server";
import { getServicesTree } from "~/models/service.server";
import { getSessionId } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const services = await getServicesTree();
  const projectCategories = await getProjectCategories();

  const sessionId = await getSessionId(request);
  let chat = undefined;
  if (sessionId) {
    chat = (await getChatBySession({ sessionId })) || undefined;
  }

  return { services, chat, projectCategories };
};

export default function DefaultLayout() {
  const { services, projectCategories, chat } = useLoaderData<typeof loader>();

  return (
    <React.Fragment>
      <SiteHeader services={services} projectCategoires={projectCategories} />
      <Outlet />
      <Footer />
      <FloatingChat chat={chat} />
    </React.Fragment>
  );
}
