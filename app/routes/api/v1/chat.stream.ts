import { eventStream } from "remix-utils/sse/server";
import { Route } from "./+types/chat.stream";
import { onMessage } from "~/lib/message-events.server";

export async function loader({ request, params }: Route.LoaderArgs) {
  const chatId = Number(params.id);

  return eventStream(request.signal, function setup(send) {
    const cleanup = onMessage((message) => {
      if (message.chatId === chatId) {
        send({
          event: "new-message",
          data: JSON.stringify(message),
        });
      }
    });

    return cleanup;
  });
}
