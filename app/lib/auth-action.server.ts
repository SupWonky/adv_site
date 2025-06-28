import { requireUserId } from "~/session.server";

export function withAuth<T extends { request: Request }, R>(
  actionFn: (args: T) => Promise<R>
): (args: T) => Promise<R> {
  return async (args: T): Promise<R> => {
    await requireUserId(args.request);
    return actionFn(args);
  };
}
