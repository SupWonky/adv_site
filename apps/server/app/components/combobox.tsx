import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { cn } from "~/lib/utils";

/**
 * Option item structure for the Combobox
 */
export interface ComboboxOption<T = string> {
  value: T;
  label: string;
}

export interface ComboboxProps<T = string> {
  /** Title displayed when no value is selected */
  title: string;
  /** List of selectable options */
  options: ComboboxOption<T>[];
  /** Callback fired when an option is selected */
  onSelect?: (value: string) => void;
  /** Currently selected value */
  selectedValue: string | null;
  /** Placeholder text for the search input */
  searchPlaceholder?: string;
  /** Text to display when no options match the search query */
  noResultsText?: string;
  /** Optional CSS class names */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * A customizable combobox component that provides a searchable dropdown selection
 */
export function Combobox<T = string>({
  title,
  options,
  onSelect,
  selectedValue,
  searchPlaceholder = "Поиск...",
  noResultsText = "Ничего не найдено.",
  className,
  disabled = false,
}: ComboboxProps<T>) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(selectedValue);

  // Update internal state when selectedValue prop changes
  useEffect(() => {
    setValue(selectedValue);
  }, [selectedValue]);

  // Find the selected option label
  const selectedOption = options.find((option) => option.value === value);
  const displayText = selectedOption?.label || title;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={title}
          disabled={disabled}
          className={cn(
            "justify-between w-60",
            !value && "text-muted-foreground",
            className
          )}
          onClick={() => setOpen(!open)}
          data-testid="combobox-trigger"
        >
          <span className="text-ellipsis overflow-hidden whitespace-nowrap max-w-full pr-2">
            {displayText}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            className="h-9"
            aria-label={searchPlaceholder}
          />
          <CommandList>
            <CommandEmpty>{noResultsText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={String(option.value)}
                  value={String(option.value)}
                  onSelect={(currentValue) => {
                    setValue(currentValue);
                    setOpen(false);
                    onSelect?.(currentValue);
                  }}
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
