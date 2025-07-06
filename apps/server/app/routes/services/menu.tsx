import { Link } from "react-router";
import { ChevronRight } from "lucide-react";
import { cn } from "~/lib/utils";

export interface MenuProps {
  className?: string;
  items: MenuItemProps[];
}

export interface MenuItemProps {
  label: string;
  url: string;
  active?: boolean;
  submenu?: MenuItemProps[];
  root?: boolean;
}

export function Menu({ className, items }: MenuProps) {
  return (
    <nav aria-label="Main Navigation">
      <ul className={cn("flex flex-col gap-1", className)}>
        {items.map((item, idx) => (
          <MenuItem key={idx} {...item} />
        ))}
      </ul>
    </nav>
  );
}

export function MenuItem({
  label,
  url,
  submenu,
  root = false,
  active = false,
}: MenuItemProps) {
  const hasSubmenu = submenu && submenu.length > 0;

  if (root) {
    return (
      <li>
        <Link
          className={cn(
            "flex justify-between items-center px-4 py-3 rounded-lg hover:bg-muted",
            active && "bg-primary/30 text-primary hover:bg-primary/40",
            root && "font-semibold"
          )}
          to={url}
          aria-current={active ? "page" : undefined}
          aria-expanded={active}
          preventScrollReset
        >
          <span className="font-medium">{label}</span>
          {hasSubmenu && (
            <ChevronRight
              className={cn(
                "!size-5 shrink-0 transition-transform duration-200",
                active && "rotate-90"
              )}
              aria-hidden="true"
            />
          )}
        </Link>
        {hasSubmenu && (
          <div
            className={cn(
              "mt-1 ml-4 pl-2 border-l-2 border-gray-200 overflow-hidden transition-opacity",
              active ? "opacity-100" : "opacity-0 h-0"
            )}
            data-state={active ? "open" : "closed"}
          >
            <ul>
              {submenu.map((item, idx) => (
                <MenuItem key={idx} {...item} />
              ))}
            </ul>
          </div>
        )}
      </li>
    );
  }

  return (
    <li>
      <Link
        className={cn(
          "block py-2 px-3 text-sm text-muted-foreground rounded-md hover:bg-gray-50 transition-colors",
          active && "font-medium text-primary"
        )}
        to={url}
        aria-current={active ? "page" : undefined}
        aria-expanded={active}
        preventScrollReset
      >
        {label}
      </Link>
      {hasSubmenu && (
        <div
          className={cn(
            "mt-1 ml-4 pl-2 border-l border-gray-200 overflow-hidden transition-opacity",
            active ? "opacity-100" : "opacity-0 h-0"
          )}
          data-state={active ? "open" : "closed"}
        >
          <ul>
            {submenu.map((item) => (
              <MenuItem key={item.url} {...item} />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}
