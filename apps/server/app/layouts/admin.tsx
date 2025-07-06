import React from "react";
import { Route } from "./+types/admin";
import { requireUserId } from "~/session.server";
import { Outlet } from "react-router";
import { Footer } from "~/components/footer";
import { AdminHeader } from "~/components/admin-header";

export async function loader({ request }: Route.LoaderArgs) {
  await requireUserId(request);
}

export default function AdminLayout() {
  return (
    <React.Fragment>
      <AdminHeader />
      <Outlet />
      <Footer />
    </React.Fragment>
  );
}
