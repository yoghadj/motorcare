import { z } from "zod";

export const dictionaryEntrySchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional(),
});

export type DictionaryEntryInput = z.infer<typeof dictionaryEntrySchema>;
