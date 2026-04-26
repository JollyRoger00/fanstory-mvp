import { z } from "zod";

const pageSchema = z.coerce.number().int().min(1).default(1);
const pageSizeSchema = z.coerce.number().int().min(1).max(100).default(20);
const searchSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => value ?? "");
const reasonSchema = z.string().trim().min(3).max(500);

export const adminUsersQuerySchema = z.object({
  query: searchSchema,
  page: pageSchema,
  pageSize: pageSizeSchema,
});

export const adminPaymentsQuerySchema = z.object({
  page: pageSchema,
  pageSize: pageSizeSchema,
});

export const adminStoriesQuerySchema = z.object({
  query: searchSchema,
  page: pageSchema,
  pageSize: pageSizeSchema,
});

export const adminGenerationLogsQuerySchema = z.object({
  status: z
    .string()
    .trim()
    .optional()
    .transform((value) => value ?? ""),
  provider: z
    .string()
    .trim()
    .optional()
    .transform((value) => value ?? ""),
  page: pageSchema,
  pageSize: pageSizeSchema,
});

export const adminAuditQuerySchema = z.object({
  page: pageSchema,
  pageSize: pageSizeSchema,
});

export const adminWalletCreditAdjustmentSchema = z.object({
  userId: z.string().min(1),
  amount: z.coerce.number().int().refine((value) => value !== 0),
  reason: reasonSchema,
});

export const adminChapterAdjustmentSchema = z.object({
  userId: z.string().min(1),
  quantity: z.coerce.number().int().refine((value) => value !== 0),
  reason: reasonSchema,
});

export const adminGrantSubscriptionSchema = z.object({
  userId: z.string().min(1),
  productId: z.string().min(1),
  reason: reasonSchema,
});

export const adminCancelSubscriptionSchema = z.object({
  userId: z.string().min(1),
  reason: reasonSchema,
});

export const adminUpdateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["USER", "ADMIN"]),
  reason: reasonSchema,
});

export const adminEntityIdSchema = z.object({
  id: z.string().min(1),
});
