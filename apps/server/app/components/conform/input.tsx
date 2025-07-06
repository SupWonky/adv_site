import {
  FieldMetadata,
  FieldName,
  getInputProps,
  useField,
  unstable_useControl as useControl,
} from "@conform-to/react";
import { Input } from "../ui/input";
import { ComponentProps, FormEvent, useMemo, useRef, useState } from "react";
import { Check, Phone, X } from "lucide-react";
import { cn } from "~/lib/utils";

type InputProps = {
  meta: FieldMetadata<string>;
  type: Parameters<typeof getInputProps>[1]["type"];
} & ComponentProps<typeof Input>;

export function InputConform({ meta, type, className, ...props }: InputProps) {
  const { key, ...rest } = getInputProps(meta, { type, ariaAttributes: true });

  return (
    <Input
      key={key}
      className={cn(meta.errors && "border-destructive", className)}
      {...rest}
      {...props}
    />
  );
}

export function InputConformWithCounter({
  name,
  type,
  maxLength,
  ...props
}: {
  name: FieldName<string>;
  type: Parameters<typeof getInputProps>[1]["type"];
} & ComponentProps<typeof Input>) {
  const [meta] = useField(name);

  return (
    <div className="relative">
      <InputConform
        meta={meta}
        className="pr-8"
        {...props}
        type={type}
        maxLength={maxLength}
      />
      {maxLength && (
        <div className="absolute right-3 top-3 text-muted-foreground text-xs">
          {maxLength - (meta.value?.length || 0)}
        </div>
      )}
    </div>
  );
}

export function InputPhoneConform({
  meta,
  supportedCountries = ["7", "1"],
}: {
  meta: FieldMetadata<string>;
  supportedCountries?: string[];
}) {
  const control = useControl(meta);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Initialize with formatted value if there's an initial value
  const initialFormatted = useMemo(() => {
    return meta.initialValue ? formatPhoneNumber(meta.initialValue) : "";
  }, [meta.initialValue]);

  const [displayValue, setDisplayValue] = useState(initialFormatted);

  const getRawPhoneNumber = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 11);
  };

  const formatPhoneNumber = (digits: string) => {
    if (!digits) return "";

    const countryCode = digits[0] || "";
    const rest = digits.slice(1);

    let formatted = `+${countryCode}`;
    if (rest.length === 0) return formatted;

    formatted += ` (${rest.slice(0, 3)}`;
    if (rest.length <= 3) return formatted;

    formatted += `) ${rest.slice(3, 6)}`;
    if (rest.length <= 6) return formatted;

    formatted += `-${rest.slice(6, 8)}`;
    if (rest.length <= 8) return formatted;

    return formatted + `-${rest.slice(8, 10)}`;
  };

  const handleOnChange = (e: FormEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    const rawValue = getRawPhoneNumber(target.value);
    const formattedValue = formatPhoneNumber(rawValue);

    setDisplayValue(formattedValue);
    control.change(rawValue);
  };

  const isValidPhoneNumber = () => {
    const rawValue = getRawPhoneNumber(displayValue);
    return rawValue.length >= 11 && supportedCountries.includes(rawValue[0]);
  };

  const getInputStatus = () => {
    if (!displayValue || isFocused) return "default";
    return isValidPhoneNumber() ? "valid" : "invalid";
  };

  const status = getInputStatus();

  return (
    <div className="space-y-1">
      <div className="relative">
        {/* Hidden input for form control */}
        <input
          className="sr-only"
          aria-hidden
          tabIndex={-1}
          ref={control.register}
          name={meta.name}
          defaultValue={meta.initialValue}
          onFocus={() => inputRef.current?.focus()}
        />

        <div
          className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors
          ${status === "valid" ? "text-primary" : ""} 
          ${status === "invalid" ? "text-destructive" : ""}`}
        >
          <Phone className="size-4" />
        </div>

        {/* Visible input */}
        <Input
          placeholder="+7 (000) 000-00-00"
          autoComplete="tel"
          type="tel"
          className={cn(
            "pl-10 pr-4 transition-colors",
            meta.errors && "border-destructive"
          )}
          ref={inputRef}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            control.blur();
          }}
          value={displayValue}
          onChange={handleOnChange}
          aria-invalid={status === "invalid"}
        />

        {displayValue && !isFocused && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {status === "valid" && (
              <div className="text-primary rounded-full bg-primary/10 p-0.5">
                <Check className="size-3" />
              </div>
            )}
            {status === "invalid" && (
              <div className="text-destructive rounded-full bg-destructive/10 p-0.5">
                <X className="size-3" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
