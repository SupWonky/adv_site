import { Form, Link, NavLink } from "react-router";
import { useOptionalUser } from "~/utils";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuContent,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";

export function User() {
  const user = useOptionalUser();

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-row items-center gap-6">
      <div className="space-x-8 flex">
        <NavLink
          className={({ isActive }) =>
            `transition-colors ${
              isActive ? "text-indigo-500" : ""
            } hover:text-indigo-500`
          }
          to="/admin/services"
        >
          Услуги
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `transition-colors ${
              isActive ? "text-indigo-500" : ""
            } hover:text-indigo-500`
          }
          to="/admin/projects"
        >
          Проекты
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `transition-colors ${
              isActive ? "text-indigo-500" : ""
            } hover:text-indigo-500`
          }
          to="/admin/chat"
        >
          Чат
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `transition-colors ${
              isActive ? "text-indigo-500" : ""
            } hover:text-indigo-500`
          }
          to="/admin/submissions"
        >
          Заявки
        </NavLink>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            type="button"
          >
            <Avatar className="h-9 w-9 border-2 border-indigo-100">
              <AvatarFallback className="bg-indigo-50 text-indigo-700">
                {user.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Профиль</DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings">Настройки</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <LogoutDropdownMenuButton />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function LogoutDropdownMenuButton() {
  return (
    <Form method="post" action="/api/v1/logout">
      <DropdownMenuItem asChild>
        <button className="w-full" type="submit">
          Выйти
        </button>
      </DropdownMenuItem>
    </Form>
  );
}
