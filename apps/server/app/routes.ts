import {
  index,
  layout,
  prefix,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

export default [
  layout("./layouts/default.tsx", [
    index("./routes/home/index.tsx"),
    route("login", "./routes/login.tsx"),
    route("services", "./routes/services/index.tsx"),
    route("services/*", "./routes/services/service.tsx"),
    ...prefix("projects", [
      index("./routes/projects/index.tsx"),
      route(":slug", "./routes/projects/project.tsx"),
    ]),
  ]),
  ...prefix("api/v1", [
    route("chat", "./routes/api/v1/chat.ts"),
    route("logout", "./routes/api/v1/logout.ts"),
    route("category", "./routes/api/v1/category.ts"),
    route("upload", "./routes/api/v1/upload.ts"),
    route("form/:id", "./routes/api/v1/form.ts"),
    route("chat/:id", "./routes/api/v1/chat.stream.ts"),
  ]),
  layout("./layouts/admin.tsx", [
    ...prefix("admin", [
      ...prefix("services", [
        index("./routes/admin/services/route.tsx"),
        route("new", "./routes/admin/services/new-service.tsx"),
        route(":id/edit", "./routes/admin/services/edit-service.tsx"),
      ]),
      ...prefix("projects", [
        index("./routes/admin/projects/route.tsx"),
        route("new", "./routes/admin/projects/new-project.tsx"),
        route(":id/edit", "./routes/admin/projects/edit-project.tsx"),
      ]),
      route("chat", "./routes/admin/chats/route.tsx", [
        index("./routes/admin/chats/index.tsx"),
        route(":id", "./routes/admin/chats/chat.tsx"),
      ]),
      ...prefix("forms", [
        index("./routes/admin/forms/index.tsx"),
        route("new", "./routes/admin/forms/new-form.tsx"),
        route(":id/edit", "./routes/admin/forms/edit-form.tsx"),
      ]),
      ...prefix("submissions", [
        index("./routes/admin/submissions/index.tsx"),
        route("form/:id", "./routes/admin/submissions/form.tsx"),
      ]),
      route("settings", "./routes/admin/settings.tsx"),
    ]),
  ]),
  route("file/:id", "./routes/api/v1/file.ts"),
] satisfies RouteConfig;
