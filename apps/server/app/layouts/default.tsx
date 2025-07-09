import { LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData } from "react-router";
import { Fragment } from "react";
import { FloatingChat } from "~/components/floating-chat";
import { Footer } from "~/components/footer";
import { SiteHeader } from "~/components/header";
import { getChatBySession } from "~/models/chat.server";
import { getProjectCategories } from "~/models/project.server";
import { getServicesTree } from "~/models/service.server";
import { settingService } from "~/models/setting.server";
import { SETTINGS_REGISTRY } from "~/routes/admin/settings";
import { getSessionId } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const sessionId = await getSessionId(request);

  const [services, projectCategories, info, chat] = await Promise.all([
    getServicesTree(),
    getProjectCategories(),
    settingService.getSetting("info", SETTINGS_REGISTRY.info.schema),
    sessionId ? getChatBySession(sessionId) : Promise.resolve(null),
  ]);

  return { services, chat: chat || undefined, projectCategories, info };
};

export default function DefaultLayout() {
  const { services, projectCategories, chat } = useLoaderData<typeof loader>();

  return (
    <Fragment>
      <SiteHeader services={services} projectCategoires={projectCategories} />
      <Outlet />
      <Footer />
      <FloatingChat chat={chat} />
    </Fragment>
  );
}
