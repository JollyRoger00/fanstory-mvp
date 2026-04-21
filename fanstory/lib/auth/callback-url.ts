const defaultCallbackUrl = "/dashboard";

export function sanitizeCallbackUrl(value?: string | null) {
  if (!value) {
    return defaultCallbackUrl;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return defaultCallbackUrl;
  }

  return value;
}
