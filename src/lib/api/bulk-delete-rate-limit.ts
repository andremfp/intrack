import { toasts } from "@/utils/toasts";
import { ErrorMessages } from "@/errors";
import { checkRateLimit } from "@/lib/api/rate-limit";

/**
 * Wraps the bulk delete rate limit check so we can keep the UI-side guard
 * centralized and easier to test.
 */
export async function ensureBulkDeleteAllowed(): Promise<boolean> {
  const result = await checkRateLimit("bulk_delete");
  if (!result.success || !result.data.allowed) {
    toasts.error("Erro", ErrorMessages.TOO_MANY_REQUESTS);
    return false;
  }

  return true;
}
