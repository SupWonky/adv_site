import { parseWithZod } from "@conform-to/zod";
import { ChatMessage } from "@prisma/client";
import { ActionFunctionArgs } from "react-router";
import { emitMessage } from "~/lib/message-events.server";
import {
  createChat,
  createMessage,
  getChatBySession,
} from "~/models/chat.server";
import { MessageSchema } from "~/schema/zod";
import { getSessionId, getUserId } from "~/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await getUserId(request);
  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema: MessageSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { text, chatId } = submission.value;
  let newMessage: ChatMessage | undefined = undefined;

  if (!chatId) {
    const sessionId = await getSessionId(request);

    if (!sessionId) {
      throw new Response("Not Found", { status: 404 });
    }

    const existingChat = await getChatBySession({ sessionId: sessionId });

    if (existingChat) {
      newMessage = await createMessage({
        chatId: existingChat.id,
        text,
        userId,
      });
    } else {
      const newChat = await createChat({ sessionId });
      newMessage = await createMessage({ chatId: newChat.id, text, userId });
    }
  } else {
    newMessage = await createMessage({ chatId, text, userId });
  }

  if (newMessage) {
    emitMessage(newMessage);
  }

  return submission.reply({ resetForm: true });
};
