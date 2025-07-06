import {
  FieldMetadata,
  unstable_useControl as useControl,
} from "@conform-to/react";
import { ComponentProps, ElementRef, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export function SelectConform({
  meta,
  items,
  placeholder,
  ...props
}: {
  meta: FieldMetadata<string>;
  items: Array<{ name: string; value: string }>;
  placeholder: string;
} & ComponentProps<typeof Select>) {
  const control = useControl(meta);
  const selectRef = useRef<ElementRef<typeof SelectTrigger>>(null);

  return (
    <>
      <select
        className="sr-only"
        aria-hidden
        name={meta.name}
        ref={control.register}
        onFocus={() => selectRef.current?.focus()}
        defaultValue={meta.initialValue ?? ""}
        tabIndex={-1}
      >
        <option value="" />
        {items.map((option) => (
          <option key={option.value} value={option.value} />
        ))}
      </select>

      <Select
        value={control.value ?? ""}
        onValueChange={(value) => control.change(value)}
        onOpenChange={(open) => {
          if (!open) {
            control.blur();
          }
        }}
        {...props}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((option) => (
            <SelectItem value={option.value} key={option.value}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
