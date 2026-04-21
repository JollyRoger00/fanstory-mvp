import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { messagesByLocale, type Messages } from "@/lib/i18n/messages";

export type MessageKey = string;
export type TranslationValues = Record<string, string | number | boolean>;

function getNestedValue(
  object: Record<string, unknown>,
  path: string,
): unknown {
  return path.split(".").reduce<unknown>((current, segment) => {
    if (current && typeof current === "object" && segment in current) {
      return (current as Record<string, unknown>)[segment];
    }

    return undefined;
  }, object);
}

function formatTemplate(template: string, values?: TranslationValues) {
  if (!values) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = values[key];
    return value === undefined ? `{${key}}` : String(value);
  });
}

export function getMessagesForLocale(locale: Locale): Messages {
  return messagesByLocale[locale];
}

export function normalizeLocale(locale?: string | null): Locale {
  return isLocale(locale) ? locale : defaultLocale;
}

export function createTranslator(locale: Locale) {
  const messages = getMessagesForLocale(locale) as Record<string, unknown>;

  return {
    locale,
    t(key: MessageKey, values?: TranslationValues): string {
      const resolved = getNestedValue(messages, key);

      if (typeof resolved !== "string") {
        throw new Error(
          `Translation key "${key}" does not resolve to a string.`,
        );
      }

      return formatTemplate(resolved, values);
    },
    raw<T>(key: MessageKey): T {
      return getNestedValue(messages, key) as T;
    },
  };
}
