import enMessages from "@/lib/i18n/messages/en";
import ruMessages from "@/lib/i18n/messages/ru";
import type { Locale } from "@/lib/i18n/config";

type MessagePrimitive = string | number | boolean | null;

export type MessageValue =
  | MessagePrimitive
  | readonly MessageValue[]
  | {
      readonly [key: string]: MessageValue;
    };

export type Messages = {
  readonly [key: string]: MessageValue;
};

export const messagesByLocale: Record<Locale, Messages> = {
  en: enMessages as unknown as Messages,
  ru: ruMessages as unknown as Messages,
};
