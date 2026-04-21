import { z } from "zod";

export const purchaseProductSchema = z.object({
  productId: z.string().min(1),
});
