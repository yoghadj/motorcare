import type { Locale } from "@/lib/i18n";
import { en } from "@/messages/en";
import { id } from "@/messages/id";

export type Dict = typeof en;

const dictionaries: Record<Locale, Dict> = { en, id };

export function getDictionary(locale: Locale): Dict {
  return dictionaries[locale] ?? en;
}
