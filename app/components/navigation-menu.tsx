import { ChevronDown, ChevronRight } from "lucide-react";
import React from "react";
import { NavLink } from "react-router";
import { cn } from "~/lib/utils";

interface BaseMenuItem {
  label: string;
  url: string;
  className?: string;
}

interface MenuItemProps extends BaseMenuItem {
  type: "item";
}

interface NestedMenuItemProps extends BaseMenuItem {
  type: "nested";
  children?: NavigationItemType[];
  root?: boolean;
}

type NavigationItemType = MenuItemProps | NestedMenuItemProps;

interface NavigationMenuProps {
  items: NavigationItemType[];
  classNames?: {
    itemStyle: string;
    containerStyle: string;
  };
}

export function NavigationMenu({ items, classNames }: NavigationMenuProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const handleMouseEnter = (index: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveIndex(null);
    }, 300);
  };

  return (
    <div
      className={cn("hidden bg-primary lg:block", classNames?.containerStyle)}
    >
      <div className="container flex h-14 items-center">
        {items.map((item, index) => (
          <React.Fragment key={item.url}>
            {item.type === "nested" ? (
              <NestedMenuItem
                {...item}
                root
                isOpen={activeIndex === index}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
                className={classNames?.itemStyle}
              />
            ) : (
              <MenuItem {...item} className={classNames?.itemStyle} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export function NestedMenuItem({
  label,
  url,
  root = false,
  children,
  isOpen,
  onMouseEnter,
  onMouseLeave,
  className,
}: NestedMenuItemProps & {
  isOpen?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const [localOpen, setLocalOpen] = React.useState(false);
  const hasChildren = children && children.length > 0;
  const open = root ? isOpen : localOpen;

  if (root) {
    return (
      <div
        className="relative h-full"
        onMouseLeave={onMouseLeave}
        onMouseEnter={onMouseEnter}
        data-menu-container
      >
        <NavLink
          to={url}
          className={({ isActive }) =>
            cn(
              "flex items-center h-full px-4 gap-1.5 font-semibold text-background transition-colors",
              open && "bg-green-500",
              isActive ? "bg-green-700" : "hover:bg-green-500",
              className
            )
          }
          aria-expanded={open}
          aria-haspopup="true"
        >
          <span>{label}</span>
          <ChevronDown
            className={cn(
              "w-4 h-4 shrink-0 transition-transform",
              open && "rotate-180"
            )}
          />
        </NavLink>

        {hasChildren && (
          <div
            className={cn(
              "absolute left-0 top-full w-64 text-foreground bg-background rounded-b-md shadow-lg border z-10",
              "transform origin-top-left transition-all duration-200",
              open
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95 pointer-events-none"
            )}
            role="menu"
            data-menu-container
          >
            <ul className="w-full">
              {children.map((child) =>
                child.type === "nested" ? (
                  <NestedMenuItem key={child.url} {...child} />
                ) : (
                  <li
                    className="relative group border-b last:border-none"
                    key={child.url}
                  >
                    <MenuItem {...child} />
                  </li>
                )
              )}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <li
      onMouseEnter={() => setLocalOpen(true)}
      onMouseLeave={() => setLocalOpen(false)}
      className="relative group border-b last:border-none"
    >
      <NavLink
        to={url}
        className={({ isActive }) =>
          cn(
            "flex items-center justify-between px-4 py-2 text-sm rounded-md hover:bg-gray-50 hover:text-primary break-words w-full transition-colors",
            isActive && "text-primary"
          )
        }
      >
        <span className="mr-2">{label}</span>
        {hasChildren && (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </NavLink>

      {hasChildren && (
        <div
          className={cn(
            "absolute left-full top-0 w-64 rounded-md shadow-lg bg-background border z-20 transform transition-all duration-200",
            open
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 pointer-events-none"
          )}
          role="menu"
          data-menu-container
        >
          <ul className="w-full">
            {children.map((child) =>
              child.type === "nested" ? (
                <NestedMenuItem key={child.url} {...child} />
              ) : (
                <li
                  className="relative group border-b last:border-none"
                  key={child.url}
                >
                  <MenuItem {...child} />
                </li>
              )
            )}
          </ul>
        </div>
      )}
    </li>
  );
}

export function MenuItem({ label, url, className }: MenuItemProps) {
  return (
    <NavLink
      className={({ isActive }) =>
        cn(
          "flex items-center justify-between px-4 py-2 text-sm rounded-md text-gray-800 hover:bg-gray-50 hover:text-primary w-full transition-all duration-200",
          isActive && "text-primary",
          className
        )
      }
      to={url}
    >
      {label}
    </NavLink>
  );
}

export function mapToNavigationItems<T>(
  items: T[],
  config: {
    getLabelFn: (item: T) => string;
    getUrlFn: (item: T) => string;
    getChildrenFn: (item: T) => T[] | undefined;
    shouldBeNested?: (item: T) => boolean;
  }
): NavigationMenuProps["items"] {
  const { getLabelFn, getUrlFn, getChildrenFn, shouldBeNested } = config;

  return items.map((item) => {
    const children = getChildrenFn?.(item);
    const hasChildren = children && children.length > 0;
    const isNested = shouldBeNested ? shouldBeNested(item) : hasChildren;

    if (isNested) {
      return {
        type: "nested",
        label: getLabelFn(item),
        url: getUrlFn(item),
        children: hasChildren ? mapToNavigationItems(children, config) : [],
      };
    }

    return {
      type: "item",
      label: getLabelFn(item),
      url: getUrlFn(item),
    };
  });
}
