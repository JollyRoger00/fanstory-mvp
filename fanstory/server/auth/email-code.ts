import "server-only";

import { createHash, randomInt } from "node:crypto";
import type { Transporter } from "nodemailer";
import nodemailer from "nodemailer";
import { CredentialsSignin } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import {
  emailAuthConfigured,
  getYookassaTestAccountEmails,
  getServerEnv,
  type ServerEnv,
} from "@/lib/env/server";
import type { Locale } from "@/lib/i18n/config";
import { APP_NAME } from "@/lib/site";

const EMAIL_CODE_LENGTH = 6;
const EMAIL_CODE_TTL_MS = 15 * 60 * 1000;
const EMAIL_CODE_RESEND_COOLDOWN_MS = 60 * 1000;
const EMAIL_CODE_IDENTIFIER_PREFIX = "email-code";
export const YOOKASSA_TEST_ACCOUNT_CODE = "__yookassa_test_account__";

const emailSchema = z
  .string()
  .trim()
  .email()
  .transform((value) => value.toLowerCase());

const emailCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/);

const emailCodeVerificationSchema = z.object({
  email: emailSchema,
  code: emailCodeSchema,
});

type MailTransportCache = {
  transporter?: Transporter;
  transporterSignature?: string;
};

const globalForEmailTransport = globalThis as typeof globalThis & {
  __fanstoryEmailTransport?: MailTransportCache;
};

export type EmailCodeIssueResult =
  | {
      status: "success";
      email: string;
    }
  | {
      status: "rate_limited";
      email: string;
      retryAfterSeconds: number;
    };

export class EmailAuthNotConfiguredError extends CredentialsSignin {
  code = "email_auth_not_configured";
}

export class InvalidEmailCodeError extends CredentialsSignin {
  code = "invalid_email_code";
}

export class ExpiredEmailCodeError extends CredentialsSignin {
  code = "expired_email_code";
}

export function normalizeEmail(value: string) {
  return emailSchema.parse(value);
}

export function parseEmailCodeVerificationInput(input: {
  email: string;
  code: string;
}) {
  return emailCodeVerificationSchema.parse(input);
}

export function isYookassaTestAccountEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);

  return getYookassaTestAccountEmails().includes(normalizedEmail);
}

function maskEmailForLogs(email: string) {
  const [localPart = "", domain = ""] = email.split("@");

  if (!domain) {
    return email;
  }

  if (localPart.length <= 2) {
    return `${localPart[0] ?? ""}***@${domain}`;
  }

  return `${localPart.slice(0, 2)}***${localPart.slice(-1)}@${domain}`;
}

function logEmailAuthInfo(
  event: string,
  details: Record<string, unknown> = {},
) {
  console.info("[email-auth:info]", {
    event,
    ...details,
  });
}

function logEmailAuthError(
  event: string,
  error: unknown,
  details: Record<string, unknown> = {},
) {
  const smtpError =
    error && typeof error === "object"
      ? (error as Record<string, unknown>)
      : {};

  console.error("[email-auth:error]", {
    event,
    ...details,
    name:
      error instanceof Error
        ? error.name
        : typeof smtpError.name === "string"
          ? smtpError.name
          : null,
    message:
      error instanceof Error
        ? error.message
        : typeof smtpError.message === "string"
          ? smtpError.message
          : String(error),
    code: typeof smtpError.code === "string" ? smtpError.code : null,
    command: typeof smtpError.command === "string" ? smtpError.command : null,
    response:
      typeof smtpError.response === "string" ? smtpError.response : null,
    responseCode:
      typeof smtpError.responseCode === "number"
        ? smtpError.responseCode
        : null,
  });
}

function getEmailCodeIdentifier(email: string) {
  return `${EMAIL_CODE_IDENTIFIER_PREFIX}:${email}`;
}

function getEmailCodeIssuedAt(expires: Date) {
  return new Date(expires.getTime() - EMAIL_CODE_TTL_MS);
}

function getEmailCodeExpiryDate(now = new Date()) {
  return new Date(now.getTime() + EMAIL_CODE_TTL_MS);
}

function generateEmailCode() {
  return randomInt(0, 10 ** EMAIL_CODE_LENGTH)
    .toString()
    .padStart(EMAIL_CODE_LENGTH, "0");
}

function hashEmailCode(email: string, code: string) {
  const env = getServerEnv();

  return createHash("sha256")
    .update(`${env.AUTH_SECRET}:${email}:${code}`)
    .digest("hex");
}

function getTransporterSignature(env: ServerEnv) {
  return [
    env.AUTH_EMAIL_SERVER_HOST,
    env.AUTH_EMAIL_SERVER_PORT,
    env.AUTH_EMAIL_SERVER_USER,
    env.AUTH_EMAIL_SERVER_PASSWORD,
    env.AUTH_EMAIL_SERVER_SECURE,
  ].join(":");
}

function getMailTransporter() {
  if (!emailAuthConfigured()) {
    throw new EmailAuthNotConfiguredError();
  }

  const env = getServerEnv();
  const cache =
    globalForEmailTransport.__fanstoryEmailTransport ??
    (globalForEmailTransport.__fanstoryEmailTransport = {});
  const signature = getTransporterSignature(env);

  if (
    cache.transporter &&
    cache.transporterSignature &&
    cache.transporterSignature === signature
  ) {
    return cache.transporter;
  }

  const transporter = nodemailer.createTransport({
    host: env.AUTH_EMAIL_SERVER_HOST,
    port: env.AUTH_EMAIL_SERVER_PORT,
    secure: env.AUTH_EMAIL_SERVER_SECURE || env.AUTH_EMAIL_SERVER_PORT === 465,
    auth: {
      user: env.AUTH_EMAIL_SERVER_USER,
      pass: env.AUTH_EMAIL_SERVER_PASSWORD,
    },
  });

  cache.transporter = transporter;
  cache.transporterSignature = signature;

  return transporter;
}

function buildEmailCopy(locale: Locale, code: string) {
  if (locale === "ru") {
    return {
      subject: `${APP_NAME}: код входа ${code}`,
      text: [
        `Код для входа в ${APP_NAME}: ${code}`,
        "",
        "Код действует 15 минут.",
        "Если вы не запрашивали вход, просто проигнорируйте это письмо.",
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
          <p style="margin:0 0 16px">Код для входа в <strong>${APP_NAME}</strong></p>
          <p style="margin:0 0 20px;font-size:32px;font-weight:700;letter-spacing:0.3em">${code}</p>
          <p style="margin:0 0 8px">Код действует 15 минут.</p>
          <p style="margin:0">Если вы не запрашивали вход, просто проигнорируйте это письмо.</p>
        </div>
      `,
    };
  }

  return {
    subject: `${APP_NAME}: sign-in code ${code}`,
    text: [
      `Your ${APP_NAME} sign-in code: ${code}`,
      "",
      "This code expires in 15 minutes.",
      "If you did not request it, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <p style="margin:0 0 16px">Your sign-in code for <strong>${APP_NAME}</strong></p>
        <p style="margin:0 0 20px;font-size:32px;font-weight:700;letter-spacing:0.3em">${code}</p>
        <p style="margin:0 0 8px">This code expires in 15 minutes.</p>
        <p style="margin:0">If you did not request it, you can ignore this email.</p>
      </div>
    `,
  };
}

async function sendEmailCodeMessage({
  email,
  code,
  locale,
}: {
  email: string;
  code: string;
  locale: Locale;
}) {
  if (!emailAuthConfigured()) {
    throw new EmailAuthNotConfiguredError();
  }

  const env = getServerEnv();
  const transporter = getMailTransporter();
  const message = buildEmailCopy(locale, code);

  logEmailAuthInfo("message_sending", {
    email: maskEmailForLogs(email),
    providerHost: env.AUTH_EMAIL_SERVER_HOST,
    providerPort: env.AUTH_EMAIL_SERVER_PORT,
    secure: env.AUTH_EMAIL_SERVER_SECURE || env.AUTH_EMAIL_SERVER_PORT === 465,
  });

  try {
    await transporter.sendMail({
      from: env.AUTH_EMAIL_FROM,
      to: email,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });

    logEmailAuthInfo("message_sent", {
      email: maskEmailForLogs(email),
    });
  } catch (error) {
    logEmailAuthError("message_failed", error, {
      email: maskEmailForLogs(email),
    });
    throw error;
  }
}

export async function issueEmailSignInCode({
  email: rawEmail,
  locale,
}: {
  email: string;
  locale: Locale;
}): Promise<EmailCodeIssueResult> {
  if (!emailAuthConfigured()) {
    throw new EmailAuthNotConfiguredError();
  }

  const email = normalizeEmail(rawEmail);
  const identifier = getEmailCodeIdentifier(email);
  const now = new Date();

  logEmailAuthInfo("request_started", {
    email: maskEmailForLogs(email),
  });

  await prisma.verificationToken.deleteMany({
    where: {
      identifier,
      expires: {
        lte: now,
      },
    },
  });

  const latestToken = await prisma.verificationToken.findFirst({
    where: {
      identifier,
    },
    orderBy: {
      expires: "desc",
    },
  });

  if (latestToken) {
    const resendAvailableAt = new Date(
      getEmailCodeIssuedAt(latestToken.expires).getTime() +
        EMAIL_CODE_RESEND_COOLDOWN_MS,
    );

    if (resendAvailableAt > now) {
      logEmailAuthInfo("request_rate_limited", {
        email: maskEmailForLogs(email),
        retryAfterSeconds: Math.ceil(
          (resendAvailableAt.getTime() - now.getTime()) / 1000,
        ),
      });

      return {
        status: "rate_limited",
        email,
        retryAfterSeconds: Math.ceil(
          (resendAvailableAt.getTime() - now.getTime()) / 1000,
        ),
      };
    }
  }

  const code = generateEmailCode();
  const expires = getEmailCodeExpiryDate(now);
  const token = hashEmailCode(email, code);

  await prisma.verificationToken.deleteMany({
    where: {
      identifier,
    },
  });

  await prisma.verificationToken.create({
    data: {
      identifier,
      token,
      expires,
    },
  });

  try {
    await sendEmailCodeMessage({
      email,
      code,
      locale,
    });
  } catch (error) {
    await prisma.verificationToken.deleteMany({
      where: {
        identifier,
      },
    });

    logEmailAuthError("request_failed", error, {
      email: maskEmailForLogs(email),
    });

    throw error;
  }

  logEmailAuthInfo("request_succeeded", {
    email: maskEmailForLogs(email),
  });

  return {
    status: "success",
    email,
  };
}

export async function authorizeEmailCodeSignIn(credentials: {
  email?: unknown;
  code?: unknown;
}) {
  const email = normalizeEmail(String(credentials.email ?? ""));

  if (
    String(credentials.code ?? "") === YOOKASSA_TEST_ACCOUNT_CODE &&
    isYookassaTestAccountEmail(email)
  ) {
    const user = await prisma.user.upsert({
      where: {
        email,
      },
      update: {
        emailVerified: new Date(),
      },
      create: {
        email,
        emailVerified: new Date(),
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
    };
  }

  if (!emailAuthConfigured()) {
    throw new EmailAuthNotConfiguredError();
  }

  const { code } = parseEmailCodeVerificationInput({
    email,
    code: String(credentials.code ?? ""),
  });
  const identifier = getEmailCodeIdentifier(email);
  const token = hashEmailCode(email, code);

  return prisma.$transaction(async (tx) => {
    const verificationToken = await tx.verificationToken.findFirst({
      where: {
        identifier,
        token,
      },
    });

    if (!verificationToken) {
      throw new InvalidEmailCodeError();
    }

    if (verificationToken.expires <= new Date()) {
      await tx.verificationToken.deleteMany({
        where: {
          identifier,
        },
      });

      throw new ExpiredEmailCodeError();
    }

    await tx.verificationToken.deleteMany({
      where: {
        identifier,
      },
    });

    const existingUser = await tx.user.findUnique({
      where: {
        email,
      },
    });

    const user = existingUser
      ? await tx.user.update({
          where: {
            id: existingUser.id,
          },
          data: {
            emailVerified: existingUser.emailVerified ?? new Date(),
          },
        })
      : await tx.user.create({
          data: {
            email,
            emailVerified: new Date(),
          },
        });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
    };
  });
}
