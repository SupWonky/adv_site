import { Chat, ChatMessage, User } from "@prisma/client";
import { prisma } from "~/db.server";

export async function createChat({
  sessionId,
}: {
  sessionId: Chat["guestSessionId"];
}) {
  return prisma.chat.create({
    data: {
      guestSessionId: sessionId,
    },
  });
}

export async function getChatBySession(sessionId: Chat["guestSessionId"]) {
  return prisma.chat.findFirst({
    where: {
      guestSessionId: sessionId,
    },
    include: {
      messages: true,
    },
  });
}

export async function getChatById(id: Chat["id"]) {
  return prisma.chat.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
}

export async function getChats() {
  return prisma.chat.findMany({
    include: { messages: { take: 1, orderBy: { createdAt: "desc" } } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createMessage({
  chatId,
  text,
  userId,
}: {
  chatId: Chat["id"];
  text: ChatMessage["text"];
  userId?: User["id"];
}) {
  const res = await prisma.$transaction([
    prisma.chat.update({
      data: {
        updatedAt: new Date(),
      },
      where: {
        id: chatId,
      },
    }),
    prisma.chatMessage.create({
      data: { chatId, text, userId },
    }),
  ]);

  return res[1];
}
