import { useState, useEffect, useRef, useMemo } from "react";
import { MessageSquare, ArrowUp } from "lucide-react";
import { useFetcher } from "react-router";
import { ChatMessage } from "@prisma/client";
import { useForm } from "@conform-to/react";
import { action } from "~/routes/api/v1/chat";
import { InputConform } from "./conform/input";
import { parseWithZod } from "@conform-to/zod";
import { MessageSchema } from "~/schema/zod";
import { useOptionalUser } from "~/utils";
import { cn, formatDate, getMessagePoistion, isSameDay } from "~/lib/utils";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Button } from "./ui/button";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Cross1Icon } from "@radix-ui/react-icons";
import { useEventSource } from "remix-utils/sse/react";
import { deserializeMessage } from "~/lib/message-serialization";
import { Message } from "./message";
import { Badge } from "./ui/badge";

interface Chat {
  id: number;
  messages: ChatMessage[];
}

export function FloatingChat({ chat }: { chat?: Chat }) {
  const user = useOptionalUser();
  const fetcher = useFetcher<typeof action>();
  const [messages, setMessages] = useState<ChatMessage[]>(chat?.messages ?? []);
  const [isOpen, setOpen] = useState<boolean>(false);
  const [form, fields] = useForm({
    lastResult: fetcher.state === "idle" ? fetcher.data : undefined,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: MessageSchema });
    },
  });
  const newMessage = useEventSource(`/api/v1/chat/${chat?.id}`, {
    event: "new-message",
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const grouppedMessages = useMemo(() => {
    if (messages.length === 0) {
      return [];
    }

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

    for (const message of messages) {
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
    }

    if (currentGroup.length > 0) {
      grouped.push({ type: "message", data: currentGroup });
    }

    return grouped;
  }, [messages]);

  useEffect(() => {
    if (!isOpen) return;

    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, [isOpen, chat?.messages.length]);

  useEffect(() => {
    if (newMessage) {
      const message = deserializeMessage(JSON.parse(newMessage));
      setMessages((prev) => [...prev, message]);
    }
  }, [newMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (chat) {
      setMessages(chat.messages);
    }
  }, [chat?.id]);

  if (user) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 bg-black/40 hover:bg-black/50 border-border/30 border backdrop-blur data-[state=open]:scale-0 data-[state=open]:opacity-0"
        >
          <MessageSquare className="!size-6" />
        </Button>
      </PopoverTrigger>

      <PopoverAnchor asChild>
        <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8" />
      </PopoverAnchor>

      <PopoverContent
        align="end"
        side="top"
        className="p-0 w-80 sm:w-96 bg-background/90 supports-[backdrop-filter]:bg-background/60 backdrop-blur border rounded-xl shadow-xl flex flex-col h-[500px] max-h-[var(--radix-popover-content-available-height)]"
      >
        {/* Header */}
        <div className="relative flex justify-between items-center px-4 py-3 bg-background rounded-t-xl before:content-[''] before:bg-gradient-to-b before:from-background before:to-background/0 before:w-full before:z-10 before:absolute before:top-full before:left-0 before:h-4">
          <div className="absolute z-10 flex flex-col items-center left-1/2 -translate-y-4 -translate-x-1/2">
            <Avatar className="w-16 h-16 shadow-lg">
              <AvatarImage src="/chat-staff.jpg" />
            </Avatar>
            <div className="text-center leading-4 text-sm text-popover-foreground">
              Менеджер по работе с клиентами Артем
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="ml-auto opacity-70 hover:opacity-100 transition-opacity rounded-full"
          >
            <Cross1Icon className="h-5 w-5" />
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto p-4 relative scroll-smooth"
          ref={containerRef}
        >
          <div className="space-y-2.5">
            {grouppedMessages?.map((group, index) => {
              if (group.type === "date") {
                return (
                  <div key={index} className="flex items-center justify-center">
                    <Badge className="text-xs rounded-full" variant="secondary">
                      {formatDate(group.date)}
                    </Badge>
                  </div>
                );
              }

              const messageGroup = group.data;
              const userId = messageGroup[0].userId;
              const isCurrentUser = !Boolean(userId);
              const size = messageGroup.length;

              return (
                <div className="flex flex-col gap-1" key={index}>
                  {messageGroup.map((msg, idx) => (
                    <Message
                      isCurrentUser={isCurrentUser}
                      message={msg}
                      isGroup={size > 1}
                      groupPosition={getMessagePoistion(idx, size)}
                      key={msg.id}
                    />
                  ))}
                </div>
              );
            })}
          </div>

          {/* Loading indicator */}
          {fetcher.state !== "idle" && (
            <div className="flex flex-col gap-1 items-center">
              <div className="bg-muted rounded-2xl py-3 px-4 text-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary/90 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-primary/90 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-primary/90 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
        {/* Input Area */}
        <div className="border-t p-4 bg-background rounded-b-xl">
          <fetcher.Form
            id={form.id}
            action="/api/v1/chat"
            method="post"
            className="flex gap-2 items-end"
          >
            {chat && <input type="hidden" name="chatId" value={chat.id} />}

            <div className="flex-1">
              <InputConform
                type="text"
                meta={fields.text}
                placeholder="Введите сообщение..."
                className="rounded-full px-4 py-2 text-sm resize-none min-h-[40px] max-h-[120px]"
                autoComplete="off"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    const form = e.currentTarget.form;
                    if (form && fields.text.value?.trim()) {
                      fetcher.submit(form);
                    }
                  }
                }}
              />
            </div>

            <Button
              type="submit"
              size="icon"
              className="rounded-full h-10 w-10 flex-shrink-0"
              disabled={
                fetcher.state === "submitting" || !fields.text.value?.trim()
              }
            >
              <ArrowUp size={18} />
            </Button>
          </fetcher.Form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
