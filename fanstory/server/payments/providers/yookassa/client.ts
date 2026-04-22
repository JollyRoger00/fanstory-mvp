import "server-only";

import { Buffer } from "node:buffer";
import { getServerEnv } from "@/lib/env/server";

type YookassaRequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  idempotenceKey?: string;
};

function getAuthHeader() {
  const env = getServerEnv();
  const credentials = Buffer.from(
    `${env.YOOKASSA_SHOP_ID}:${env.YOOKASSA_SECRET_KEY}`,
  ).toString("base64");

  return `Basic ${credentials}`;
}

function getApiUrl(path: string) {
  const env = getServerEnv();
  return `${env.YOOKASSA_API_URL}${path}`;
}

export class YookassaApiError extends Error {
  readonly status: number;
  readonly body: string;

  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = "YookassaApiError";
    this.status = status;
    this.body = body;
  }
}

export async function yookassaRequest<T>(
  path: string,
  options: YookassaRequestOptions = {},
) {
  const response = await fetch(getApiUrl(path), {
    method: options.method ?? "GET",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
      ...(options.idempotenceKey
        ? {
            "Idempotence-Key": options.idempotenceKey,
          }
        : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  const rawBody = await response.text();

  if (!response.ok) {
    throw new YookassaApiError(
      `YooKassa request failed with status ${response.status}.`,
      response.status,
      rawBody,
    );
  }

  if (!rawBody) {
    return null as T;
  }

  return JSON.parse(rawBody) as T;
}

