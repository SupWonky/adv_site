import { NavLink, Outlet, useLoaderData, useLocation } from "react-router";
import { MessageCircle } from "lucide-react";
import { cn, formatRealtiveTime } from "~/lib/utils";
import { getChats } from "~/models/chat.server";

export const loader = async () => {
  const chats = await getChats();

  return { chats };
};

export default function InboxLayout() {
  const { chats } = useLoaderData<typeof loader>();
  const location = useLocation();

  return (
    <div className="lg:rounded-xl overflow-hidden lg:shadow max-w-screen-lg mx-auto border flex flex-row w-full h-[80svh] my-12">
      <div
        className={cn(
          "w-full md:max-w-xs lg:max-w-sm md:border-r flex flex-col bg-background",
          !location.pathname.endsWith("/chat") && "hidden md:block"
        )}
      >
        <div className="p-4 border-b">
          <h1 className="text-2xl font-semibold text-foreground">Чаты</h1>
        </div>

        {chats.length > 0 ? (
          <ul className="overflow-y-auto flex-1">
            {chats.map((chat) => {
              const lastMessage = chat.messages.at(0);

              return (
                <li key={chat.id} className="border-b">
                  <NavLink
                    to={`/admin/chat/${chat.id}`}
                    className={({ isActive }) =>
                      `flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors ${
                        isActive ? "bg-accent/40" : ""
                      }`
                    }
                  >
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-lg">👤</span>
                      </div>
                      {/* Online status indicator */}
                      {/* <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" /> */}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-semibold truncate">Гость</h3>
                        <span className="text-xs text-muted-foreground">
                          {formatRealtiveTime(chat.updatedAt)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground truncate">
                          {lastMessage?.text || "Новое сообщение"}
                        </p>
                      </div>
                    </div>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 text-muted-foreground">
              <MessageCircle strokeWidth={1} className="mx-auto h-16 w-16" />
            </div>
            <h2 className="text-xl font-medium text-foreground mb-2">
              Здесь пусто
            </h2>
            <p className="text-muted-foreground mb-6">
              Здесь будут отображаться ваши собеседники
            </p>
          </div>
        )}
      </div>

      <Outlet />
    </div>
  );
}
