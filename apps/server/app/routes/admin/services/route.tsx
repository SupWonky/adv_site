import { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { Form, Link, useLoaderData } from "react-router";
import {
  ChevronDown,
  ChevronRight,
  Edit2,
  Eye,
  EyeOff,
  FolderTree,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  deleteService,
  getServiceList,
  updateServiceStatus,
} from "~/models/service.server";
import { requireUserId } from "~/session.server";
import { useState } from "react";
import { getImageURL } from "~/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { withAuth } from "~/lib/auth-action.server";

// TypeScript interfaces
interface Service {
  id: string;
  name: string;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
  parentId: string | null;
  path: string;
  image?: {
    uri: string;
  };
}

interface ServiceNode extends Service {
  children: ServiceNode[];
}

interface ExpandedCategories {
  [key: string]: boolean;
}

interface LoaderData {
  services: Service[];
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const services = await getServiceList();

  return { services };
};

export const action = withAuth(async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const serviceId = formData.get("serviceId");

  if (typeof serviceId !== "string" || serviceId.length === 0) {
    return new Response("Invalid service", { status: 400 });
  }

  switch (intent) {
    case "delete": {
      await deleteService(serviceId);
      return { success: true };
    }
    case "publish": {
      await updateServiceStatus(serviceId, "PUBLISHED");
      return { success: true };
    }
    case "unpublish": {
      await updateServiceStatus(serviceId, "DRAFT");
      return { success: true };
    }
  }
});

export default function ServicesPage() {
  const { services } = useLoaderData<LoaderData>();
  const [expandedCategories, setExpandedCategories] =
    useState<ExpandedCategories>({});

  const toggleCategory = (categoryId: string): void => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const buildServiceTree = (): ServiceNode[] => {
    const serviceMap: Record<string, ServiceNode> = {};
    services.forEach((service) => {
      serviceMap[service.id] = { ...service, children: [] };
    });

    const tree: ServiceNode[] = [];
    services.forEach((service) => {
      if (service.parentId === null) {
        tree.push(serviceMap[service.id]);
      } else if (serviceMap[service.parentId]) {
        serviceMap[service.parentId].children.push(serviceMap[service.id]);
      }
    });

    return tree;
  };

  const serviceTree = buildServiceTree();

  const TreeNode = ({
    node,
    level = 0,
  }: {
    node: ServiceNode;
    level?: number;
  }) => {
    const isExpanded = expandedCategories[node.id];
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div className="w-full">
        <div
          className={`flex items-center p-3 hover:bg-gray-50 rounded-md transition-colors`}
        >
          <div className="flex items-center flex-1 min-w-0">
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-6 w-6 mr-2 flex-shrink-0"
                onClick={() => toggleCategory(node.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <div className="w-6 mr-2 flex-shrink-0" />
            )}

            {node.image ? (
              <img
                src={getImageURL(node.image.uri)}
                alt=""
                className="h-8 w-8 rounded object-cover mr-3 flex-shrink-0"
              />
            ) : (
              <div className="h-8 w-8 bg-gray-100 rounded flex items-center justify-center mr-3 flex-shrink-0">
                <FolderTree className="h-4 w-4 text-gray-400" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">{node.name}</div>
              <div className="text-xs text-gray-500">
                {new Date(node.createdAt).toLocaleDateString(
                  new Intl.Locale("ru-RU")
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge
              variant={node.status === "DRAFT" ? "outline" : "default"}
              className={`mr-2 ${
                node.status === "DRAFT"
                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                  : "bg-green-100 text-green-800 hover:bg-green-200"
              }`}
            >
              {node.status === "DRAFT" ? "Черновик" : "Опубликовано"}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-8 w-8 data-[state=open]:bg-accent"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer flex items-center w-full gap-2"
                >
                  <Link to={`${node.id}/edit`}>
                    <Edit2 className="size-4" />
                    Редактировать
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer flex items-center w-full gap-2"
                >
                  <Link to={`new?parentId=${node.id}`}>
                    <Plus className="size-4" />
                    Добавить услугу
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Form method="post" className="w-full">
                    <input type="hidden" name="serviceId" value={node.id} />
                    <button
                      type="submit"
                      name="intent"
                      value={node.status === "DRAFT" ? "publish" : "unpublish"}
                      className="w-full text-left flex items-center gap-2"
                    >
                      {node.status === "DRAFT" ? (
                        <>
                          <Eye className="h-4 w-4" />
                          Опубликовать
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-4 w-4" />
                          Скрыть
                        </>
                      )}
                    </button>
                  </Form>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                  <Form method="post" className="w-full">
                    <input type="hidden" name="serviceId" value={node.id} />
                    <button
                      type="submit"
                      name="intent"
                      value="delete"
                      className="w-full text-left flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Удалить
                    </button>
                  </Form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l ml-7 pl-2 mt-1 mb-1">
            {node.children.map((child) => (
              <TreeNode key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 my-12">
      <div className="flex flex-col gap-8 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Услуги</h1>
          <p className="mt-1 text-muted-foreground">
            Управляйте вашими услугами и категориями
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/admin/services/new">
            <Plus className="h-4 w-4" />
            Добавить услугу
          </Link>
        </Button>
      </div>

      <Card>
        <ScrollArea className="w-full">
          <div className="p-4">
            {serviceTree.map((node) => (
              <TreeNode key={node.id} node={node} />
            ))}
          </div>

          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </Card>
    </div>
  );
}
