import { z } from "zod";

export const startPaymentCheckoutSchema = z.object({
  productId: z.string().min(1),
});

