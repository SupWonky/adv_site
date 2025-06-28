import { ChatMessage } from "@prisma/client";
import { cn } from "~/lib/utils";

interface MessageProps {
  message: ChatMessage;
  isCurrentUser: boolean;
  isGroup: boolean;
  groupPosition: "start" | "center" | "end";
  classNames?: {
    container?: string;
    innerContainer?: string;
  };
}

export function Message({
  message,
  isCurrentUser,
  isGroup,
  groupPosition,
  classNames,
}: MessageProps) {
  const getBorderRadius = () => {
    if (!isGroup) {
      return isCurrentUser
        ? "rounded-2xl rounded-br-md"
        : "rounded-2xl rounded-bl-md";
    }

    const baseRadius = "rounded-2xl";

    switch (groupPosition) {
      case "start":
        return isCurrentUser
          ? `${baseRadius} rounded-br-md`
          : `${baseRadius} rounded-bl-md`;
      case "center" || "end":
        return isCurrentUser
          ? "rounded-l-2xl rounded-r-md rounded-tr-md rounded-br-md"
          : "rounded-r-2xl rounded-l-md rounded-tl-md rounded-bl-md";
      case "end":
        return isCurrentUser
          ? "rounded-l-2xl rounded-tr-md rounded-br-2xl rounded-tl-2xl"
          : "rounded-r-2xl rounded-tl-md rounded-bl-2xl rounded-tr-2xl";
      default:
        return baseRadius;
    }
  };

  return (
    <div
      className={cn(
        "flex",
        isCurrentUser ? "justify-end" : "justify-start",
        classNames?.container
      )}
    >
      <div
        className={cn(
          "group relative max-w-[80%] flex gap-2",
          isCurrentUser && "flex-row-reverse",
          classNames?.innerContainer
        )}
      >
        <div
          className={cn(
            "relative px-3 py-2 shadow",
            getBorderRadius(),
            isCurrentUser
              ? "bg-primary text-primary-foreground"
              : "bg-background border border-border text-foreground"
          )}
        >
          <div className="flex flex-wrap items-end justify-end">
            <p className="relative text-sm leading-relaxed whitespace-pre-wrap break-all">
              {message.text}
            </p>

            <time
              className={cn(
                "text-xs select-none inline-block ml-2",
                isCurrentUser
                  ? "text-primary-foreground/70"
                  : "text-muted-foreground"
              )}
              dateTime={message.createdAt.toISOString()}
              title={message.createdAt.toLocaleString("ru-RU", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            >
              {message.createdAt.toLocaleTimeString("ru-RU", {
                timeStyle: "short",
              })}
            </time>
          </div>

          {/* Optional: Message status indicators for current user */}
          {isCurrentUser && (
            <div className="absolute -bottom-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          )}
        </div>
      </div>
    </div>
  );
}
