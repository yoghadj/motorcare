import { z } from "zod";
import { currentYear, minYear } from "@/config/motorcycle-brands";

export const motorcycleSchema = z.object({
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().int().min(minYear).max(currentYear),
  engineCc: z.number().int().positive("Engine CC must be positive"),
  licensePlate: z.string().max(20).optional().nullable(),
  purchaseDate: z.string().optional().nullable(),
  currentOdometer: z.number().int().min(0, "Odometer must be >= 0"),
  nickname: z.string().max(100).optional().nullable(),
});

export type MotorcycleInput = z.infer<typeof motorcycleSchema>;
