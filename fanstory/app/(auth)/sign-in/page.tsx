import { CircleAlert } from "lucide-react";
import { redirect } from "next/navigation";
import { EmailAuthForm } from "@/features/auth/components/email-auth-form";
import { GoogleSignInButton } from "@/features/auth/components/google-sign-in-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { sanitizeCallbackUrl } from "@/lib/auth/callback-url";
import { emailAuthConfigured } from "@/lib/env/server";
import { getI18n } from "@/lib/i18n/server";
import { getCurrentUser } from "@/server/auth/session";

type SignInPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
    error?: string;
    code?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const { locale } = await getI18n();
  const callbackUrl = sanitizeCallbackUrl(params.callbackUrl);
  const emailEnabled = emailAuthConfigured();
  const copy = getSignInPageCopy(locale);
  const authError = resolveSignInErrorMessage(
    copy,
    params.error,
    params.code,
    emailEnabled,
  );

  if (user) {
    redirect(callbackUrl);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_28%),linear-gradient(180deg,_#fffef8_0%,_#f6f2ea_100%)] px-6 py-16">
      <Card className="w-full max-w-lg rounded-[2rem] border-white/60 bg-white/85 shadow-xl">
        <CardHeader className="space-y-4 text-center">
          <Badge className="mx-auto rounded-full bg-amber-100 text-amber-900 hover:bg-amber-100">
            {copy.badge}
          </Badge>
          <CardTitle className="font-heading text-5xl text-slate-950">
            {copy.title}
          </CardTitle>
          <p className="text-sm leading-7 text-slate-600">{copy.description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {authError ? (
            <Alert className="border-amber-200 bg-amber-50/90 text-amber-950">
              <CircleAlert className="size-4" />
              <AlertDescription className="text-amber-900">
                {authError}
              </AlertDescription>
            </Alert>
          ) : null}

          {emailEnabled ? (
            <>
              <EmailAuthForm callbackUrl={callbackUrl} copy={copy.email} />
              <div className="flex items-center gap-4">
                <Separator className="flex-1" />
                <span className="text-xs font-medium tracking-[0.2em] text-slate-400 uppercase">
                  {copy.orDivider}
                </span>
                <Separator className="flex-1" />
              </div>
            </>
          ) : null}

          <GoogleSignInButton callbackUrl={callbackUrl} />
        </CardContent>
      </Card>
    </div>
  );
}

function resolveSignInErrorMessage(
  copy: ReturnType<typeof getSignInPageCopy>,
  error?: string,
  code?: string,
  emailEnabled?: boolean,
) {
  if (!error) {
    return null;
  }

  if (error === "OAuthAccountNotLinked") {
    return copy.errors.oauthAccountNotLinked;
  }

  if (error === "AccessDenied") {
    return copy.errors.accessDenied;
  }

  if (error === "CredentialsSignin" && code === "invalid_email_code") {
    return copy.email.invalidEmailCode;
  }

  if (error === "CredentialsSignin" && code === "expired_email_code") {
    return copy.email.expiredCode;
  }

  if (error === "CredentialsSignin" && !emailEnabled) {
    return copy.email.notConfigured;
  }

  return copy.errors.generic;
}

function getSignInPageCopy(locale: "en" | "ru") {
  if (locale === "ru") {
    return {
      badge: "Вход и регистрация",
      title: "Войти в FanStory",
      description:
        "Используйте код из письма или Google, чтобы открыть свои истории, сохранения и доступ к главам.",
      orDivider: "или",
      errors: {
        oauthAccountNotLinked:
          "Этот Google-аккаунт пока не привязан. Сначала войдите по email или используйте исходный способ входа.",
        accessDenied: "Вход был отклонён. Попробуйте ещё раз.",
        generic: "Не удалось выполнить вход. Попробуйте ещё раз.",
      },
      email: {
        title: "Продолжить по email",
        description:
          "Мы отправим на вашу почту одноразовый код подтверждения из 6 цифр.",
        emailLabel: "Email",
        emailPlaceholder: "you@example.com",
        sendCode: "Отправить код",
        sendingCode: "Отправляем код...",
        resendCode: "Отправить код ещё раз",
        codeLabel: "Код подтверждения",
        codePlaceholder: "123456",
        verifyCode: "Продолжить",
        verifyingCode: "Проверяем код...",
        codeSentNotice: "Мы отправили 6-значный код на {email}.",
        rateLimitedNotice:
          "Код уже был отправлен недавно. Подождите {seconds} сек. и попробуйте снова.",
        invalidEmail: "Введите корректный email.",
        invalidCode: "Введите 6-значный код из письма.",
        invalidEmailCode:
          "Код не подошёл. Попробуйте ещё раз или запросите новый.",
        expiredCode: "Срок действия кода истёк. Запросите новый.",
        notConfigured:
          "Вход по email пока не настроен. Используйте Google или завершите настройку почтового сервера.",
        deliveryFailed:
          "Сейчас не удалось отправить письмо. Попробуйте ещё раз чуть позже.",
        unexpected: "Что-то пошло не так. Попробуйте ещё раз.",
      },
    };
  }

  return {
    badge: "Sign in or create account",
    title: "Continue to FanStory",
    description:
      "Use a one-time email code or Google to open your stories, saves, and chapter access.",
    orDivider: "or",
    errors: {
      oauthAccountNotLinked:
        "This Google account is not linked yet. Sign in with email first or use the original provider.",
      accessDenied: "Sign-in was denied. Please try again.",
      generic: "Sign-in failed. Please try again.",
    },
    email: {
      title: "Continue with email",
      description:
        "We will send a 6-digit confirmation code to your email address.",
      emailLabel: "Email",
      emailPlaceholder: "you@example.com",
      sendCode: "Send code",
      sendingCode: "Sending code...",
      resendCode: "Resend code",
      codeLabel: "Confirmation code",
      codePlaceholder: "123456",
      verifyCode: "Continue",
      verifyingCode: "Checking code...",
      codeSentNotice: "We sent a 6-digit code to {email}.",
      rateLimitedNotice:
        "A code was already sent recently. Please wait {seconds} seconds before trying again.",
      invalidEmail: "Enter a valid email address.",
      invalidCode: "Enter the 6-digit code from your email.",
      invalidEmailCode:
        "The code is incorrect. Request a new one or try again.",
      expiredCode: "This code has expired. Request a new one.",
      notConfigured:
        "Email sign-in is not configured yet. Use Google or finish the email server setup.",
      deliveryFailed:
        "We could not send the email right now. Please try again in a moment.",
      unexpected: "Something went wrong. Please try again.",
    },
  };
}
