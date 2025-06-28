import { useRef, useState, forwardRef } from "react";
import { Label } from "./ui/label";
import { cn } from "~/lib/utils"; // Assumes your project uses tailwindcss-merge
import { Textarea } from "./ui/textarea";

interface TextareaProps extends React.ComponentProps<"textarea"> {
  limit: number;
  title: string;
  description?: string;
  errors?: string[];
}

export const TextareaInput = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ limit, id, name, title, errors, className, ...props }, forwardedRef) => {
    const localRef = useRef<HTMLTextAreaElement>(null);
    const inputRef = forwardedRef || localRef;
    const [counter, setCounter] = useState(
      props.defaultValue?.toString().length || 0
    );
    const isOverLimit = counter > limit;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCounter(e.target.value.length);
      props.onChange?.(e);
    };

    return (
      <div>
        <div className="flex justify-between items-center">
          <Label className="text-base" htmlFor={id}>
            {title}
          </Label>
          <span
            className={cn(
              "text-sm font-normal text-muted-foreground",
              isOverLimit && "text-destructive"
            )}
          >
            {counter} из {limit} символов
          </span>
        </div>

        <div className="mt-1">
          <Textarea
            id={id}
            ref={inputRef}
            name={name}
            className={cn(
              isOverLimit && "focus-visible:ring-destructive",
              //error && "focus-visible:ring-destructive",
              className
            )}
            onChange={handleChange}
            {...props}
            placeholder={props.placeholder || title}
          />

          {errors && (
            <div className="p-1 text-sm text-destructive">{errors}</div>
          )}
        </div>
      </div>
    );
  }
);

TextareaInput.displayName = "TextareaInput";
