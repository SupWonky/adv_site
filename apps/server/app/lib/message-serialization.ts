import { ChatMessage } from "@prisma/client";

export type SerializedChatMessage = Omit<
  ChatMessage,
  "createdAt" | "updatedAt"
> & {
  createdAt: string;
  updatedAt: string | null;
};

export function serializeMessage(message: ChatMessage): SerializedChatMessage {
  return {
    ...message,
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt?.toISOString() || null,
  };
}

export function deserializeMessage(serialized: any): ChatMessage {
  return {
    ...serialized,
    createdAt: new Date(serialized.createdAt),
    updatedAt: serialized.updatedAt ? new Date(serialized.updatedAt) : null,
  };
}
