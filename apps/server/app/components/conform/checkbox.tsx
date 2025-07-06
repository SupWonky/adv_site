import {
  FieldMetadata,
  unstable_useControl as useControl,
} from "@conform-to/react";
import { ElementRef, useRef } from "react";
import { Checkbox } from "../ui/checkbox";

export function CheckboxConform({
  meta,
}: {
  meta: FieldMetadata<boolean | undefined | string>;
}) {
  const control = useControl(meta);
  const checkboxRef = useRef<ElementRef<typeof Checkbox>>(null);

  return (
    <>
      <input
        className="sr-only"
        aria-hidden
        ref={control.register}
        defaultValue={meta.initialValue}
        name={meta.name}
        onFocus={() => checkboxRef.current?.focus()}
      />
      <Checkbox
        id={meta.id}
        ref={checkboxRef}
        onCheckedChange={(checked) => {
          control.change(checked ? "on" : "");
        }}
        onBlur={control.blur}
        defaultChecked={meta.initialValue === "on"}
      />
    </>
  );
}
