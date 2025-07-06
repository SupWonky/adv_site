import { useFetcher } from "react-router";
import { Link, useLoaderData } from "react-router";
import { ArrowLeft, ArrowUp } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { formatDate, getMessagePoistion, isSameDay } from "~/lib/utils";
import { getChatById } from "~/models/chat.server";
import { parseWithZod } from "@conform-to/zod";
import { useForm } from "@conform-to/react";
import { InputConform } from "~/components/conform/input";
import { ChatMessage } from "@prisma/client";
import { MessageSchema } from "~/schema/zod";
import { action } from "~/routes/api/v1/chat";
import { Route } from "./+types/chat";
import { Message } from "~/components/message";
import { useEventSource } from "remix-utils/sse/react";
import { deserializeMessage } from "~/lib/message-serialization";

export const loader = async ({ params }: Route.LoaderArgs) => {
  const chatId = Number(params.id);
  const chat = await getChatById(chatId);

  if (!chat) {
    throw new Response("Not Found", { status: 404 });
  }

  return { chat };
};

export default function ChatPage() {
  const { chat } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [form, fields] = useForm({
    lastResult: fetcher.state === "idle" ? fetcher.data : undefined,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: MessageSchema });
    },
  });
  const [messages, setMessages] = useState<ChatMessage[]>(chat.messages);
  const newMessage = useEventSource(`/api/v1/chat/${chat.id}`, {
    event: "new-message",
  });

  useEffect(() => {
    setMessages(chat.messages);
  }, [chat.messages]);

  useEffect(() => {
    const node = containerRef.current;
    if (node) {
      node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (newMessage) {
      const message = deserializeMessage(JSON.parse(newMessage));
      setMessages((prev) => [...prev, message]);
    }
  }, [newMessage]);

  const groupedItems = useMemo(() => {
    const grouped: Array<
      | { type: "date"; date: Date }
      | {
          type: "message";
          data: ChatMessage[];
        }
    > = [];

    let currentGroup: ChatMessage[] = [];
    let prevUserId = messages[0].userId;
    let prevDate = messages[0].createdAt;

    grouped.push({ type: "date", date: prevDate });

    messages.forEach((message) => {
      if (!isSameDay(message.createdAt, prevDate)) {
        if (currentGroup.length > 0) {
          grouped.push({ type: "message", data: currentGroup });
          currentGroup = [];
        }

        grouped.push({ type: "date", date: message.createdAt });
        prevDate = message.createdAt;
        prevUserId = message.userId;
      }

      if (prevUserId !== message.userId) {
        grouped.push({ type: "message", data: currentGroup });
        currentGroup = [];
      }

      currentGroup.push(message);
      prevUserId = message.userId;
    });

    if (currentGroup.length > 0) {
      grouped.push({ type: "message", data: currentGroup });
    }

    return grouped;
  }, [messages]);

  return (
    <div className="flex flex-col flex-1 h-full relative">
      <div className="px-4 py-3 border-b flex items-center gap-3 backdrop-blur bg-background/60 absolute top-0 left-0 right-0 z-10">
        <Link
          to=".."
          className="md:hidden p-2 hover:bg-accent rounded-full shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <span className="text-sm">👥</span>
            </div>
            {/* <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" /> */}
          </div>
          <div>
            <h2 className="font-semibold">Гость</h2>
            {/* <p className="text-sm text-muted-foreground">Онлайн</p> */}
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="w-full h-full overflow-y-auto space-y-4 bg-background py-20 px-4"
      >
        {groupedItems.length > 0 && (
          <div className="flex gap-y-4 flex-col">
            {groupedItems.map((item, index) => {
              if (item.type === "date") {
                return (
                  <div key={index} className="flex items-center py-1">
                    <div className="flex-grow border-t" />
                    <span className="px-3 text-xs font-medium text-muted-foreground bg-background">
                      {formatDate(item.date)}
                    </span>
                    <div className="flex-grow border-t" />
                  </div>
                );
              }

              const messageGroup = item.data;
              const size = messageGroup.length;
              const userId = messageGroup[0].userId;
              const isCurrentUser = !Boolean(userId);

              return (
                <div className="flex flex-col gap-1" key={index}>
                  {messageGroup.map((msg, idx) => (
                    <Message
                      isCurrentUser={isCurrentUser}
                      message={msg}
                      isGroup={size > 1}
                      groupPosition={getMessagePoistion(idx, size)}
                      key={msg.id}
                      classNames={{ innerContainer: "max-w-[70%]" }}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <fetcher.Form
        id={form.id}
        action="/api/v1/chat"
        method="post"
        className="py-2.5 px-4 border-t absolute bottom-0 left-0 right-0 z-10 bg-background"
      >
        <div className="flex gap-2">
          <InputConform
            meta={fields.text}
            placeholder="Введите сообщение..."
            autoComplete="off"
            className="rounded-full h-11"
            type="text"
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full w-11 h-11 shrink-0"
            aria-label="Send message"
          >
            <ArrowUp className="w-4 h-4" />
          </Button>
        </div>
        <input
          name={fields.chatId.name}
          value={chat.id}
          type="hidden"
          readOnly
        />
      </fetcher.Form>
    </div>
  );
}
