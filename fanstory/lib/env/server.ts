import { z } from "zod";

const serverEnvSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DATABASE_URL: z.url(),
    DIRECT_URL: z.url().optional(),
    AUTH_SECRET: z.string().min(32),
    AUTH_GOOGLE_ID: z.string().min(1),
    AUTH_GOOGLE_SECRET: z.string().min(1),
    AUTH_TRUST_HOST: z
      .string()
      .optional()
      .transform((value) => value === "true"),
    NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
    STORY_PROVIDER: z.enum(["mock", "openai"]).default("mock"),
    OPENAI_API_KEY: z.string().min(1).optional(),
    OPENAI_MODEL: z.string().min(1).optional(),
    PAYMENT_PROVIDER: z.enum(["disabled", "yookassa"]).default("disabled"),
    YOOKASSA_SHOP_ID: z.string().min(1).optional(),
    YOOKASSA_SECRET_KEY: z.string().min(1).optional(),
    YOOKASSA_API_URL: z.url().default("https://api.yookassa.ru/v3"),
    YOOKASSA_WEBHOOK_IP_CHECK: z
      .string()
      .optional()
      .transform((value) => value === "true"),
    REWARDED_AD_PROVIDER: z
      .enum(["disabled", "mock", "yandex"])
      .default("disabled"),
    REWARDED_AD_DAILY_LIMIT: z.coerce.number().int().min(1).max(20).default(5),
    YAN_REWARDED_DESKTOP_BLOCK_ID: z.string().min(1).optional(),
    YAN_REWARDED_MOBILE_BLOCK_ID: z.string().min(1).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.NODE_ENV === "production" && value.STORY_PROVIDER === "mock") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["STORY_PROVIDER"],
        message:
          "STORY_PROVIDER=mock is not allowed in production. Use STORY_PROVIDER=openai.",
      });
    }

    if (value.STORY_PROVIDER === "openai") {
      if (!value.OPENAI_API_KEY) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["OPENAI_API_KEY"],
          message: "OPENAI_API_KEY is required when STORY_PROVIDER=openai.",
        });
      }

      if (!value.OPENAI_MODEL) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["OPENAI_MODEL"],
          message: "OPENAI_MODEL is required when STORY_PROVIDER=openai.",
        });
      }
    }

    if (value.PAYMENT_PROVIDER !== "yookassa") {
      return;
    }

    if (!value.YOOKASSA_SHOP_ID) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["YOOKASSA_SHOP_ID"],
        message: "YOOKASSA_SHOP_ID is required when PAYMENT_PROVIDER=yookassa.",
      });
    }

    if (!value.YOOKASSA_SECRET_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["YOOKASSA_SECRET_KEY"],
        message:
          "YOOKASSA_SECRET_KEY is required when PAYMENT_PROVIDER=yookassa.",
      });
    }

    if (value.NODE_ENV === "production" && value.REWARDED_AD_PROVIDER === "mock") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["REWARDED_AD_PROVIDER"],
        message:
          "REWARDED_AD_PROVIDER=mock is not allowed in production. Use REWARDED_AD_PROVIDER=yandex or disabled.",
      });
    }

    if (value.REWARDED_AD_PROVIDER !== "yandex") {
      return;
    }

    if (!value.YAN_REWARDED_DESKTOP_BLOCK_ID) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["YAN_REWARDED_DESKTOP_BLOCK_ID"],
        message:
          "YAN_REWARDED_DESKTOP_BLOCK_ID is required when REWARDED_AD_PROVIDER=yandex.",
      });
    }

    if (!value.YAN_REWARDED_MOBILE_BLOCK_ID) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["YAN_REWARDED_MOBILE_BLOCK_ID"],
        message:
          "YAN_REWARDED_MOBILE_BLOCK_ID is required when REWARDED_AD_PROVIDER=yandex.",
      });
    }
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(`Invalid server environment variables:\n${issues}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

export function paymentsEnabled() {
  return getServerEnv().PAYMENT_PROVIDER !== "disabled";
}

export function yookassaEnabled() {
  return getServerEnv().PAYMENT_PROVIDER === "yookassa";
}
