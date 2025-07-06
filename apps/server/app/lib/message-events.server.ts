import { ChatMessage } from "@prisma/client";
import EventEmitter from "events";
import { serializeMessage } from "./message-serialization";

class MessageEventEmitter extends EventEmitter {}

export const messageEvents = new MessageEventEmitter();

export const emitMessage = (message: ChatMessage) => {
  messageEvents.emit("new-message", serializeMessage(message));
};

export const onMessage = (callback: (message: any) => void) => {
  messageEvents.on("new-message", callback);
  return () => messageEvents.off("new-message", callback);
};
