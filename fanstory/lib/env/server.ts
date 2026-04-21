import { z } from "zod";

const serverEnvSchema = z.object({
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
  STORY_FREE_CHAPTERS: z.coerce.number().int().positive().default(1),
  STORY_DEFAULT_CHAPTER_PRICE: z.coerce.number().int().positive().default(15),
  STORY_DEMO_TOP_UP_AMOUNT: z.coerce.number().int().positive().default(100),
  STORY_STARTER_CREDITS: z.coerce.number().int().nonnegative().default(60),
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
