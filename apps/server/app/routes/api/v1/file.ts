import { fileStorage } from "~/storage.server";
import { Route } from "./+types/file";

export async function loader({ params }: Route.LoaderArgs) {
  const file = await fileStorage.get(params.id);

  if (!file) {
    throw new Response("Not Found", { status: 404 });
  }

  return new Response(file.stream(), {
    headers: {
      "Content-Type": file.type,
      "Content-Disposition": `attachment; filename=${file.name}`,
    },
  });
}
