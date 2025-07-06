import { redirect } from "react-router";
import { logout } from "~/session.server";
import { Route } from "./+types/logout";

export const action = async ({ request }: Route.ActionArgs) => {
  return logout(request);
};

export const loader = async () => {
  redirect("/");
};
