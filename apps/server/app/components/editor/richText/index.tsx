import { cn } from "~/lib/utils";
import { serializeData } from "./seralize";
import { OutputData } from "@editorjs/editorjs";

interface RichTextProps {
  className?: string;
  content: unknown;
}

export function RichText({ content, className }: RichTextProps) {
  return (
    <div
      className={cn(
        "prose prose-sm prose-p:text-base prose-zinc dark:prose-invert break-all w-full max-w-full",
        className
      )}
    >
      {serializeData({ content: content as OutputData })}
    </div>
  );
}
