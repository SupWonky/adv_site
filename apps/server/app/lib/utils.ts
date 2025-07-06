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

export function formatRealtiveTime(data: Date) {
  const now = Date.now();
  const diffInSeconds = Math.floor((now - data.getTime()) / 1000);

  const untis = {
    day: 60 * 60 * 24,
    hour: 60 * 60,
    minute: 60,
  };

  for (const [unit, seconds] of Object.entries(untis)) {
    const interval = Math.floor(diffInSeconds / seconds);

    if (interval >= 1) {
      return realtiveFormatter.format(
        -interval,
        unit as Intl.RelativeTimeFormatUnit
      );
    }
  }

  return realtiveFormatter.format(
    -Math.floor(diffInSeconds / untis.day),
    "day"
  );
}

const dateTimeFormatter = new Intl.DateTimeFormat("ru", { timeStyle: "short" });

export function formatTime(date: Date) {
  return dateTimeFormatter.format(date);
}

export function isSameDay(value1: Date, value2: Date) {
  return (
    value1.getFullYear() === value2.getFullYear() &&
    value1.getMonth() === value2.getMonth() &&
    value1.getDate() === value2.getDate()
  );
}

const dateFormatter = new Intl.DateTimeFormat("ru", { dateStyle: "long" });

export function formatDate(date: Date) {
  return dateFormatter.format(date);
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
