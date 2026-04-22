import { z } from "zod";

const yookassaAmountSchema = z.object({
  value: z.string().min(1),
  currency: z.string().min(1),
});

const yookassaConfirmationSchema = z
  .object({
    type: z.string().optional(),
    confirmation_url: z.url().optional(),
  })
  .passthrough();

const yookassaCancellationDetailsSchema = z
  .object({
    party: z.string().optional(),
    reason: z.string().optional(),
  })
  .passthrough();

export const yookassaPaymentSchema = z
  .object({
    id: z.string().min(1),
    status: z.enum(["pending", "waiting_for_capture", "succeeded", "canceled"]),
    paid: z.boolean().optional(),
    amount: yookassaAmountSchema,
    confirmation: yookassaConfirmationSchema.optional(),
    created_at: z.iso.datetime().optional(),
    captured_at: z.iso.datetime().optional(),
    cancellation_details: yookassaCancellationDetailsSchema.optional(),
    description: z.string().optional(),
    metadata: z.record(z.string(), z.string()).optional(),
  })
  .passthrough();

export const yookassaWebhookSchema = z
  .object({
    type: z.literal("notification"),
    event: z.string().min(1),
    object: yookassaPaymentSchema,
  })
  .passthrough();

