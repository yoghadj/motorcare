import { z } from "zod";

export const odometerLogSchema = z.object({
  date: z.string().min(1, "Date is required"),
  odometer: z.number().int().min(0, "Odometer must be >= 0"),
});

export type OdometerLogInput = z.infer<typeof odometerLogSchema>;
