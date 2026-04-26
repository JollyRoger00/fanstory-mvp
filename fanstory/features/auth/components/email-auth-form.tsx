"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Mail, ShieldCheck } from "lucide-react";
import {
  submitEmailSignInForm,
  type EmailSignInErrorCode,
  type EmailSignInFormState,
} from "@/server/auth/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EmailAuthFormCopy = {
  title: string;
  description: string;
  emailLabel: string;
  emailPlaceholder: string;
  sendCode: string;
  sendingCode: string;
  resendCode: string;
  codeLabel: string;
  codePlaceholder: string;
  verifyCode: string;
  verifyingCode: string;
  codeSentNotice: string;
  rateLimitedNotice: string;
  invalidEmail: string;
  invalidCode: string;
  invalidEmailCode: string;
  expiredCode: string;
  notConfigured: string;
  deliveryFailed: string;
  unexpected: string;
};

type EmailAuthFormProps = {
  callbackUrl: string;
  copy: EmailAuthFormCopy;
};

const initialState: EmailSignInFormState = {
  step: "email",
  email: "",
};

function formatMessage(
  template: string,
  values: Record<string, string | number | undefined>,
) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = values[key];
    return value === undefined ? `{${key}}` : String(value);
  });
}

function maskEmail(email: string) {
  const [localPart = "", domain = ""] = email.split("@");

  if (!domain) {
    return email;
  }

  if (localPart.length <= 2) {
    return `${localPart[0] ?? ""}***@${domain}`;
  }

  return `${localPart.slice(0, 2)}***${localPart.slice(-1)}@${domain}`;
}

function resolveErrorMessage(
  errorCode: EmailSignInErrorCode | undefined,
  copy: EmailAuthFormCopy,
) {
  switch (errorCode) {
    case "invalid_email":
      return copy.invalidEmail;
    case "invalid_code":
      return copy.invalidCode;
    case "invalid_email_code":
      return copy.invalidEmailCode;
    case "expired_email_code":
      return copy.expiredCode;
    case "email_auth_not_configured":
      return copy.notConfigured;
    case "email_delivery_failed":
      return copy.deliveryFailed;
    case "unexpected":
      return copy.unexpected;
    default:
      return null;
  }
}

function EmailActionButton({
  idleLabel,
  pendingLabel,
}: {
  idleLabel: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      size="lg"
      className="w-full rounded-full bg-amber-500 text-slate-950 hover:bg-amber-400"
      disabled={pending}
    >
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}

export function EmailAuthForm({ callbackUrl, copy }: EmailAuthFormProps) {
  const [state, formAction] = useActionState(
    submitEmailSignInForm,
    initialState,
  );
  const showCodeStep = state.step === "code";
  const errorMessage = resolveErrorMessage(state.errorCode, copy);
  const noticeMessage =
    state.noticeCode === "code_sent"
      ? formatMessage(copy.codeSentNotice, {
          email: maskEmail(state.email),
        })
      : state.noticeCode === "rate_limited"
        ? formatMessage(copy.rateLimitedNotice, {
            seconds: state.retryAfterSeconds,
          })
        : null;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
          <Mail className="size-4 text-amber-600" />
          {copy.title}
        </div>
        <p className="text-sm leading-6 text-slate-600">{copy.description}</p>
      </div>

      {errorMessage ? (
        <Alert variant="destructive" className="border-red-200 bg-red-50/80">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {noticeMessage ? (
        <Alert className="border-emerald-200 bg-emerald-50/80 text-emerald-950">
          <ShieldCheck className="size-4" />
          <AlertDescription className="text-emerald-900">
            {noticeMessage}
          </AlertDescription>
        </Alert>
      ) : null}

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="intent" value="request-code" />
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <div className="space-y-2">
          <Label htmlFor="email-auth-email">{copy.emailLabel}</Label>
          <Input
            key={`email-${state.email || "empty"}`}
            id="email-auth-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            defaultValue={state.email}
            placeholder={copy.emailPlaceholder}
            className="h-11 rounded-2xl border-slate-200 px-4"
          />
        </div>
        <EmailActionButton
          idleLabel={showCodeStep ? copy.resendCode : copy.sendCode}
          pendingLabel={copy.sendingCode}
        />
      </form>

      {showCodeStep ? (
        <form
          action={formAction}
          className="space-y-3 rounded-[1.75rem] border border-slate-200/80 bg-slate-50/70 p-4"
        >
          <input type="hidden" name="intent" value="verify-code" />
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <input type="hidden" name="email" value={state.email} />
          <div className="space-y-2">
            <Label htmlFor="email-auth-code">{copy.codeLabel}</Label>
            <Input
              id="email-auth-code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder={copy.codePlaceholder}
              className="h-11 rounded-2xl border-slate-200 px-4 tracking-[0.3em]"
            />
          </div>
          <EmailActionButton
            idleLabel={copy.verifyCode}
            pendingLabel={copy.verifyingCode}
          />
        </form>
      ) : null}
    </div>
  );
}
