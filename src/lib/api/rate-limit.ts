import { supabase } from "@/supabase";
import type { ApiResponse } from "@/errors";
import { AppError, ErrorMessages, failure, success } from "@/errors";

const RATE_LIMIT_FUNCTION_PATH = "rate-limit";
const RATE_LIMIT_OPERATIONS = [
  "import",
  "export",
  "report",
  "bulk_delete",
] as const;

export type RateLimitOperation = (typeof RATE_LIMIT_OPERATIONS)[number];

export interface RateLimitStatus {
  allowed: boolean;
  remainingRequests: number;
  resetTime: string;
  retryAfter?: number;
}

export interface RateLimitErrorDetails {
  operationType: RateLimitOperation;
  remainingRequests?: number;
  resetTime?: string;
  retryAfter?: number;
  status?: number;
}

type RateLimitPayload = {
  operationType: RateLimitOperation;
  windowStart?: string;
};

type RateLimitApiError = {
  code?: string;
  message?: string;
  details?: Partial<RateLimitErrorDetails>;
};

type RateLimitApiErrorResponse = {
  error?: RateLimitApiError;
};

const OPERATION_LABELS: Record<RateLimitOperation, string> = {
  import: "importações",
  export: "exportações",
  report: "relatórios",
  bulk_delete: "operações de eliminação em massa",
};

function readEnv(key: string): string | undefined {
  const metaEnv =
    typeof import.meta !== "undefined" && "env" in import.meta
      ? (import.meta as { env: Record<string, string | undefined> }).env
      : undefined;
  return metaEnv?.[key] ?? process.env[key];
}

function removeTrailingSlash(value: string): string {
  return value.replace(/\/$/, "");
}

function normalizeLocalUrl(value: string): string {
  if (value.includes("localhost")) {
    return value.replace("localhost", "127.0.0.1");
  }
  return value;
}

function resolveFunctionsBaseUrl(): string {
  const override =
    readEnv("VITE_SUPABASE_FUNCTIONS_URL") ?? readEnv("VITE_FUNCTIONS_URL");
  if (override) {
    return removeTrailingSlash(override);
  }

  const localUrl = readEnv("VITE_LOCAL_SUPABASE_URL");
  if (localUrl) {
    return `${removeTrailingSlash(normalizeLocalUrl(localUrl))}/functions/v1`;
  }

  const prodUrl = readEnv("VITE_SUPABASE_URL");
  if (prodUrl) {
    return `${removeTrailingSlash(prodUrl)}/functions/v1`;
  }

  throw new AppError(
    "Não foi possível determinar o URL da função de rate limit."
  );
}

function buildRateLimitUrl(): string {
  const baseUrl = resolveFunctionsBaseUrl();
  return `${baseUrl}/${RATE_LIMIT_FUNCTION_PATH}`;
}

async function getAccessToken(): Promise<string> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  const token = session?.access_token;
  if (!token) {
    throw new AppError(ErrorMessages.AUTH_FAILED);
  }

  return token;
}

function buildRequestHeaders(token: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function getDefaultErrorMessage(
  operationType: RateLimitOperation,
  status: number
): string {
  if (status === 429) {
    return `Limite de ${OPERATION_LABELS[operationType]} atingido.`;
  }

  return `Erro ao validar o limite de ${OPERATION_LABELS[operationType]}.`;
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function callRateLimitApi(options: {
  method: "GET" | "POST";
  payload?: RateLimitPayload;
  token: string;
}): Promise<RateLimitStatus> {
  const url =
    options.method === "GET"
      ? `${buildRateLimitUrl()}?${new URLSearchParams({
          operation_type: options.payload?.operationType ?? "import",
        })}`
      : buildRateLimitUrl();

  const response = await fetch(url, {
    method: options.method,
    headers: buildRequestHeaders(options.token),
    ...(options.method === "POST" && options.payload
      ? { body: JSON.stringify(options.payload) }
      : {}),
  });

  const body = await safeJson(response);

  if (!response.ok) {
    const errorPayload = (body as RateLimitApiErrorResponse)?.error;
    const errorDetails: RateLimitErrorDetails = {
      operationType: options.payload?.operationType ?? "import",
      ...errorPayload?.details,
      status: response.status,
    };
    const message =
      errorPayload?.message ??
      getDefaultErrorMessage(
        options.payload?.operationType ?? "import",
        response.status
      );
    throw new AppError(message, errorDetails);
  }

  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    !("allowed" in body) ||
    !("remainingRequests" in body) ||
    !("resetTime" in body)
  ) {
    throw new AppError("Resposta inválida da função de rate limit.");
  }

  return body as RateLimitStatus;
}

export async function checkRateLimit(
  operationType: RateLimitOperation,
  windowStart?: string
): Promise<ApiResponse<RateLimitStatus>> {
  try {
    const token = await getAccessToken();
    const data = await callRateLimitApi({
      method: "POST",
      token,
      payload: {
        operationType,
        ...(windowStart ? { windowStart } : {}),
      },
    });
    return success(data);
  } catch (error) {
    return failure(error, "checkRateLimit");
  }
}

export async function getRateLimitStatus(
  operationType: RateLimitOperation
): Promise<ApiResponse<RateLimitStatus>> {
  try {
    const token = await getAccessToken();
    const data = await callRateLimitApi({
      method: "GET",
      token,
      payload: { operationType },
    });
    return success(data);
  } catch (error) {
    return failure(error, "getRateLimitStatus");
  }
}
