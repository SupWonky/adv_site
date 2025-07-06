import {
  FieldMetadata,
  unstable_useControl as useControl,
} from "@conform-to/react";
import { Editor } from "../editor/index.client";
import { ComponentProps, ElementRef, useRef } from "react";
import { ClientOnly } from "../client-only";
import { cn } from "~/lib/utils";
import { OutputData } from "@editorjs/editorjs";

export function EditorConform({
  meta,
  className,
  ...props
}: { meta: FieldMetadata<string> } & ComponentProps<typeof Editor>) {
  const control = useControl(meta);
  const edtiorRef = useRef<ElementRef<typeof Editor>>(null);

  return (
    <>
      <input
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        name={meta.name}
        defaultValue={meta.name}
        ref={control.register}
        onFocus={() => {
          edtiorRef.current?.focus();
        }}
      />

      <ClientOnly>
        <div
          className={cn(
            "relative h-[500px] shadow-sm overflow-hidden bg-background rounded-xl border",
            meta.errors && "border-destructive",
            className
          )}
        >
          <Editor
            id={meta.id}
            onValueChange={(value) => control.change(JSON.stringify(value))}
            ref={edtiorRef}
            onBlur={control.blur}
            className="overflow-y-auto absolute inset-0 break-all"
            initialValue={
              meta.initialValue
                ? (JSON.parse(meta.initialValue) as unknown as OutputData)
                : undefined
            }
            {...props}
          />
        </div>
      </ClientOnly>
    </>
  );
}
