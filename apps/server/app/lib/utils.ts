import { clsx, type ClassValue } from "clsx";
import slugify from "slugify";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSlug(value: string) {
  return slugify(value, {
    strict: true,
    lower: true,
  });
}

const realtiveFormatter = new Intl.RelativeTimeFormat("ru", { style: "short" });

// TODO FIX THIS, RETURINING ZERO SOMETIMES
export function formatRealtiveTime(data: Date) {
  const now = Date.now();
  const diff = now - data.getTime();

  const untis = {
    day: 60 * 60 * 24 * 1000,
    hour: 60 * 60 * 1000,
    minute: 60 * 1000,
    seconds: 1000,
  };

  for (const [unit, ms] of Object.entries(untis)) {
    const interval = Math.floor(diff / ms);

    if (interval >= 1) {
      return realtiveFormatter.format(
        -interval,
        unit as Intl.RelativeTimeFormatUnit
      );
    }
  }

  return realtiveFormatter.format(-Math.floor(diff / untis.day), "day");
}

const DATETIME_FORMAT = new Intl.DateTimeFormat("ru", { timeStyle: "short" });
const DATE_FROMAT = new Intl.DateTimeFormat("ru", { dateStyle: "long" });

export function formatTime(date: Date) {
  return DATETIME_FORMAT.format(date);
}

export function formatDate(date: Date) {
  return DATE_FROMAT.format(date);
}

export function isSameDay(value1: Date, value2: Date) {
  return (
    value1.getFullYear() === value2.getFullYear() &&
    value1.getMonth() === value2.getMonth() &&
    value1.getDate() === value2.getDate()
  );
}

const RESOURSE_ROUTE = "/file";

export function getImageURL(uri: string) {
  return `${RESOURSE_ROUTE}/${uri}`;
}

export function getMessagePoistion(idx: number, size: number) {
  if (idx === 0) {
    return "start";
  } else if (idx < size - 1) {
    return "center";
  } else {
    return "end";
  }
}

const SEPARATOR = "-";

export function parseParams(path: string) {
  const pathParts = path.split(SEPARATOR);

  if (pathParts.length < 2) {
    return undefined;
  }

  return {
    id: pathParts[0],
    slug: pathParts.slice(1).join("-"),
  };
}

type ObjectForSlug = {
  id: string | number;
  slug: string;
};

export function constructSlug(obj: ObjectForSlug) {
  return `${obj.id}-${obj.slug}`;
}
