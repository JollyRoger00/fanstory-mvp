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
    AUTH_EMAIL_FROM: z.string().email().optional(),
    AUTH_EMAIL_SERVER_HOST: z.string().min(1).optional(),
    AUTH_EMAIL_SERVER_PORT: z.coerce.number().int().positive().optional(),
    AUTH_EMAIL_SERVER_USER: z.string().min(1).optional(),
    AUTH_EMAIL_SERVER_PASSWORD: z.string().min(1).optional(),
    AUTH_EMAIL_SERVER_SECURE: z
      .string()
      .optional()
      .transform((value) => value === "true"),
    ADMIN_EMAILS: z.string().optional().default(""),
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
  })
  .superRefine((value, ctx) => {
    const emailAuthValues = [
      value.AUTH_EMAIL_FROM,
      value.AUTH_EMAIL_SERVER_HOST,
      value.AUTH_EMAIL_SERVER_PORT,
      value.AUTH_EMAIL_SERVER_USER,
      value.AUTH_EMAIL_SERVER_PASSWORD,
    ];
    const emailAuthConfigured = emailAuthValues.every(Boolean);
    const emailAuthPartiallyConfigured =
      !emailAuthConfigured && emailAuthValues.some(Boolean);

    if (emailAuthPartiallyConfigured) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["AUTH_EMAIL_FROM"],
        message:
          "AUTH_EMAIL_FROM, AUTH_EMAIL_SERVER_HOST, AUTH_EMAIL_SERVER_PORT, AUTH_EMAIL_SERVER_USER, and AUTH_EMAIL_SERVER_PASSWORD must be set together to enable email sign-in.",
      });
    }

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

export function emailAuthConfigured() {
  const env = getServerEnv();

  return Boolean(
    env.AUTH_EMAIL_FROM &&
    env.AUTH_EMAIL_SERVER_HOST &&
    env.AUTH_EMAIL_SERVER_PORT &&
    env.AUTH_EMAIL_SERVER_USER &&
    env.AUTH_EMAIL_SERVER_PASSWORD,
  );
}
