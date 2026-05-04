"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { AuthError } from "next-auth";
import { ZodError } from "zod";
import { signIn, signOut } from "@/auth";
import { sanitizeCallbackUrl } from "@/lib/auth/callback-url";
import { emailAuthConfigured, emailSignInAvailable } from "@/lib/env/server";
import { getCurrentLocale } from "@/lib/i18n/server";
import {
  EmailAuthNotConfiguredError,
  isYookassaTestAccountEmail,
  issueEmailSignInCode,
  normalizeEmail,
  parseEmailCodeVerificationInput,
  YOOKASSA_TEST_ACCOUNT_CODE,
} from "@/server/auth/email-code";

export type EmailSignInNoticeCode = "code_sent" | "rate_limited";

export type EmailSignInErrorCode =
  | "invalid_email"
  | "invalid_code"
  | "invalid_email_code"
  | "expired_email_code"
  | "email_auth_not_configured"
  | "email_delivery_failed"
  | "unexpected";

export type EmailSignInFormState = {
  step: "email" | "code";
  email: string;
  noticeCode?: EmailSignInNoticeCode;
  errorCode?: EmailSignInErrorCode;
  retryAfterSeconds?: number;
};

function createEmailSignInState(
  state: EmailSignInFormState,
): EmailSignInFormState {
  return state;
}

export async function signInWithGoogle(formData: FormData) {
  const callbackUrl = sanitizeCallbackUrl(
    formData.get("callbackUrl")?.toString(),
  );

  await signIn("google", {
    redirectTo: callbackUrl,
  });
}

export async function signOutAction() {
  await signOut({
    redirectTo: "/",
  });
}

export async function submitEmailSignInForm(
  _previousState: EmailSignInFormState,
  formData: FormData,
): Promise<EmailSignInFormState> {
  const intent = formData.get("intent")?.toString();

  if (intent === "request-code") {
    return handleEmailCodeRequest(formData);
  }

  if (intent === "verify-code") {
    return handleEmailCodeVerification(formData);
  }

  return createEmailSignInState({
    step: "email",
    email: "",
    errorCode: "unexpected",
  });
}

async function handleEmailCodeRequest(formData: FormData) {
  const email = formData.get("email")?.toString() ?? "";
  const callbackUrl = sanitizeCallbackUrl(
    formData.get("callbackUrl")?.toString(),
  );

  if (!emailSignInAvailable()) {
    return createEmailSignInState({
      step: "email",
      email,
      errorCode: "email_auth_not_configured",
    });
  }

  try {
    const normalizedEmail = normalizeEmail(email);

    if (isYookassaTestAccountEmail(normalizedEmail)) {
      await signIn("email-code", {
        email: normalizedEmail,
        code: YOOKASSA_TEST_ACCOUNT_CODE,
        redirectTo: callbackUrl,
      });

      return createEmailSignInState({
        step: "email",
        email: normalizedEmail,
      });
    }

    const result = await issueEmailSignInCode({
      email: normalizedEmail,
      locale: await getCurrentLocale(),
    });

    if (result.status === "rate_limited") {
      return createEmailSignInState({
        step: "code",
        email: result.email,
        noticeCode: "rate_limited",
        retryAfterSeconds: result.retryAfterSeconds,
      });
    }

    return createEmailSignInState({
      step: "code",
      email: result.email,
      noticeCode: "code_sent",
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof ZodError) {
      return createEmailSignInState({
        step: "email",
        email,
        errorCode: "invalid_email",
      });
    }

    if (error instanceof EmailAuthNotConfiguredError) {
      return createEmailSignInState({
        step: "email",
        email,
        errorCode: "email_auth_not_configured",
      });
    }

    return createEmailSignInState({
      step: "email",
      email,
      errorCode: "email_delivery_failed",
    });
  }
}

async function handleEmailCodeVerification(formData: FormData) {
  const emailInput = formData.get("email")?.toString() ?? "";
  const codeInput = formData.get("code")?.toString() ?? "";
  const callbackUrl = sanitizeCallbackUrl(
    formData.get("callbackUrl")?.toString(),
  );

  if (!emailAuthConfigured()) {
    return createEmailSignInState({
      step: "email",
      email: emailInput,
      errorCode: "email_auth_not_configured",
    });
  }

  try {
    const { email, code } = parseEmailCodeVerificationInput({
      email: emailInput,
      code: codeInput,
    });

    await signIn("email-code", {
      email,
      code,
      redirectTo: callbackUrl,
    });

    return createEmailSignInState({
      step: "code",
      email,
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof ZodError) {
      const emailIsValid = isValidEmailInput(emailInput);

      return createEmailSignInState({
        step: emailIsValid ? "code" : "email",
        email: emailInput,
        errorCode: emailIsValid ? "invalid_code" : "invalid_email",
      });
    }

    if (error instanceof AuthError) {
      const email = isValidEmailInput(emailInput)
        ? normalizeEmail(emailInput)
        : emailInput;

      return createEmailSignInState({
        step: "code",
        email,
        errorCode: mapEmailAuthErrorCode(error),
      });
    }

    return createEmailSignInState({
      step: "code",
      email: emailInput,
      errorCode: "unexpected",
    });
  }
}

function isValidEmailInput(email: string) {
  try {
    normalizeEmail(email);
    return true;
  } catch {
    return false;
  }
}

function mapEmailAuthErrorCode(error: AuthError): EmailSignInErrorCode {
  if ("code" in error && error.code === "invalid_email_code") {
    return "invalid_email_code";
  }

  if ("code" in error && error.code === "expired_email_code") {
    return "expired_email_code";
  }

  if ("code" in error && error.code === "email_auth_not_configured") {
    return "email_auth_not_configured";
  }

  return "unexpected";
}
