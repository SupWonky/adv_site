import {
  FieldMetadata,
  unstable_useControl as useControl,
} from "@conform-to/react";
import { useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { cn } from "~/lib/utils";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../ui/command";

type ComboboxProps = {
  meta: FieldMetadata<string>;
  options: { value: string; label: string }[];
  selectPlaceholder?: string;
  searchPlaceholder?: string;
  onAdd?: () => void;
};

export function ComboboxConform({
  meta,
  options,
  selectPlaceholder = "Выберите элемент",
  searchPlaceholder = "Поиск...",
  onAdd,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const control = useControl(meta);

  return (
    <div>
      <input
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        ref={control.register}
        defaultValue={meta.initialValue}
        name={meta.name}
        onFocus={() => {
          triggerRef.current?.focus();
        }}
      />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant="outline"
            role="combobox"
            className={cn(
              "w-64 justify-between border-input",
              !control.value && "text-muted-foreground"
            )}
          >
            <span className="truncate">
              {control.value
                ? options.find((option) => option.value === control.value)
                    ?.label
                : selectPlaceholder}
            </span>
            <ChevronsUpDown className="size-4 ml-2 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>Ничего не найдено.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    value={option.value}
                    key={option.value}
                    onSelect={() => {
                      control.change(option.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        option.value === control.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Действия">
                <CommandItem
                  onSelect={() => {
                    onAdd?.();
                  }}
                >
                  <Plus />
                  Добавить
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
