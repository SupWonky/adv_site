import {
  FieldMetadata,
  FieldName,
  getTextareaProps,
  useField,
} from "@conform-to/react";
import { Textarea } from "../ui/textarea";
import { ComponentProps } from "react";
import { cn } from "~/lib/utils";

export function TextareaConform({
  meta,
  className,
  ...props
}: {
  meta: FieldMetadata<string>;
} & ComponentProps<typeof Textarea>) {
  const { key, ...rest } = getTextareaProps(meta);
  return (
    <Textarea
      key={key}
      className={cn(meta.errors && "border-destructive", className)}
      {...rest}
      {...props}
    />
  );
}

export function TextareaConformWithCounter({
  name,
  maxLength,
  ...props
}: { name: FieldName<string> } & ComponentProps<typeof Textarea>) {
  const [meta] = useField(name);

  return (
    <div className="relative">
      <TextareaConform meta={meta} maxLength={maxLength} {...props} />

      {maxLength && (
        <div className="fixed right-3 top-3 text-muted-foreground text-xs">
          {maxLength - (meta.value?.length || 0)}
        </div>
      )}
    </div>
  );
}
