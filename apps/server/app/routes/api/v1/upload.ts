import { Route } from "./+types/upload";
import { type FileUpload, parseFormData } from "@mjackson/form-data-parser";
import { fileStorage } from "~/storage.server";
import { data, useFetcher } from "react-router";
import { createFile, getFileByUri } from "~/models/file.server";
import { FileType } from "@prisma/client";
import { withAuth } from "~/lib/auth-action.server";

export const action = withAuth(async ({ request }: Route.ActionArgs) => {
  try {
    const uploadHandler = async (fileUpload: FileUpload) => {
      if (fileUpload.fieldName === "file") {
        let type: FileType = "OTHER";
        if (fileUpload.type.startsWith("image/")) {
          type = "IMAGE";
        } else if (fileUpload.type.startsWith("video/")) {
          type = "MOVIE";
        }

        const file = await createFile({ name: fileUpload.name, type });

        await fileStorage.set(file.uri, fileUpload);

        return file.uri;
      }
    };

    const formData = await parseFormData(request, uploadHandler);
    const fileUri = formData.get("file") as string;
    const file = await getFileByUri(fileUri);

    if (!file) {
      throw new Error();
    }

    return data(
      {
        success: 1,
        file: {
          id: file.id,
          url: `/file/${file.uri}`,
          type: file.type,
          name: file.name,
        },
      },
      { status: 200 }
    );
  } catch (e) {
    console.log(e);
    throw Response.json({ success: 0 }, { status: 400 });
  }
});

export function useFileUpload() {
  const fetcher = useFetcher<typeof action>();
  const isUploading = fetcher.state !== "idle";

  return {
    submit(file: File) {
      const formData = new FormData();
      formData.set("file", file);
      fetcher.submit(formData, {
        method: "post",
        action: "/api/v1/upload",
        encType: "multipart/form-data",
        preventScrollReset: true,
      });
    },
    isUploading,
    data: fetcher.data,
  };
}
