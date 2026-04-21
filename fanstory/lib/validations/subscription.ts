import { z } from "zod";

export const activateSubscriptionSchema = z.object({
  planId: z.string().min(1),
});
