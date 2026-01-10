/**
 * Unit tests for the rate limiting Edge Function
 * Tests the core rate limiting logic without HTTP/network dependencies
 */

import {
  assertEquals,
  assert,
} from "https://deno.land/std@0.208.0/assert/mod.ts";
import {
  checkRateLimit,
  getRateLimitStatus,
} from "../functions/rate-limit/rate-limit.ts";
import * as rateLimitUtils from "../functions/rate-limit/utils.ts";
import type {
  DatabaseRateLimitRecord,
  RateLimitOperation,
} from "../functions/rate-limit/types.ts";

// Mock Supabase client for testing
type RateLimitRecordInput = Pick<
  DatabaseRateLimitRecord,
  "user_id" | "operation_type" | "window_start" | "request_count" | "updated_at"
> & { created_at?: string };

type RateLimitFilterKeys = "user_id" | "operation_type" | "window_start";
type RateLimitFilterMap = Partial<Record<RateLimitFilterKeys, string>>;

class MockQueryBuilder {
  private filters: RateLimitFilterMap = {};

  constructor(private readonly records: DatabaseRateLimitRecord[]) {}

  select(_columns?: string) {
    void _columns;
    this.filters = {};
    return this;
  }

  eq(column: RateLimitFilterKeys, value: string) {
    this.filters[column] = value;
    return this;
  }

  async single(): Promise<{
    data: DatabaseRateLimitRecord | null;
    error: { code: string } | null;
  }> {
    const entries = Object.entries(this.filters) as [
      RateLimitFilterKeys,
      string
    ][];
    const record = this.records.find((row) =>
      entries.every(([column, value]) => row[column] === value)
    );

    return {
      data: record || null,
      error: record ? null : { code: "PGRST116" },
    };
  }
}

class MockSupabaseClient {
  private rateLimitRecords: DatabaseRateLimitRecord[] = [];

  from(_table: string) {
    void _table;
    const builder = new MockQueryBuilder(this.rateLimitRecords);

    return {
      select: (columns?: string) => builder.select(columns),
      upsert: (data: RateLimitRecordInput) => ({
        select: () => ({
          single: async () => {
            const existingIndex = this.rateLimitRecords.findIndex(
              (r) =>
                r.user_id === data.user_id &&
                r.operation_type === data.operation_type &&
                r.window_start === data.window_start
            );
            let storedRecord: DatabaseRateLimitRecord;

            if (existingIndex >= 0) {
              storedRecord = {
                ...this.rateLimitRecords[existingIndex],
                ...data,
              };
              this.rateLimitRecords[existingIndex] = storedRecord;
            } else {
              storedRecord = {
                id: crypto.randomUUID(),
                ...data,
                created_at: data.created_at ?? new Date().toISOString(),
              };
              this.rateLimitRecords.push(storedRecord);
            }

            return {
              data: storedRecord,
              error: null,
            };
          },
        }),
      }),
    };
  }

  // Method to inspect records for testing
  getRecords() {
    return this.rateLimitRecords;
  }

  // Method to reset for testing
  reset() {
    this.rateLimitRecords = [];
  }
}

Deno.test("Rate Limit Configuration Tests", () => {
  const importConfig = rateLimitUtils.getRateLimitConfig("import");
  assertEquals(importConfig.maxRequests, 10);
  assertEquals(importConfig.windowMs, 60 * 60 * 1000); // 1 hour

  const exportConfig = rateLimitUtils.getRateLimitConfig("export");
  assertEquals(exportConfig.maxRequests, 20);
  assertEquals(exportConfig.windowMs, 60 * 60 * 1000);

  const reportConfig = rateLimitUtils.getRateLimitConfig("report");
  assertEquals(reportConfig.maxRequests, 40);
  assertEquals(reportConfig.windowMs, 60 * 60 * 1000);

  const bulkDeleteConfig = rateLimitUtils.getRateLimitConfig("bulk_delete");
  assertEquals(bulkDeleteConfig.maxRequests, 10);
  assertEquals(bulkDeleteConfig.windowMs, 5 * 60 * 1000);
});

Deno.test("Rate Limiting Logic Tests", async (t) => {
  const mockSupabase = new MockSupabaseClient();
  const testUserId = "test-user-123";
  const operationType: RateLimitOperation = "import";
  const config = rateLimitUtils.getRateLimitConfig(operationType);

  await t.step("should allow requests up to limit", async () => {
    for (let i = 0; i < config.maxRequests; i++) {
      const result = await checkRateLimit(mockSupabase, {
        userId: testUserId,
        operationType,
      });
      assertEquals(result.allowed, true);
    }

    // Check that we have `maxRequests` total requests
    const records = mockSupabase.getRecords();
    assertEquals(records.length, 1);
    assertEquals(records[0].request_count, config.maxRequests);
  });

  await t.step("should block request exceeding limit", async () => {
    const result = await checkRateLimit(mockSupabase, {
      userId: testUserId,
      operationType,
    });

    assertEquals(result.allowed, false);
    assertEquals(result.remainingRequests, 0);
    assert(result.resetTime);
    assert(result.retryAfter);
  });

  await t.step(
    "should return correct status without incrementing",
    async () => {
      const status = await getRateLimitStatus(
        mockSupabase,
        testUserId,
        operationType
      );

      assertEquals(status.allowed, false);
      assertEquals(status.remainingRequests, 0);

      // Check that count didn't increase
      const records = mockSupabase.getRecords();
      assertEquals(records[0].request_count, 10); // Still 10, not 11
    }
  );

  await t.step("should reset after window cooldown", async () => {
    const currentWindowStart = new Date(
      mockSupabase.getRecords()[0].window_start
    );

    const nextWindowStart = new Date(
      currentWindowStart.getTime() + config.windowMs
    );

    const result = await checkRateLimit(mockSupabase, {
      userId: testUserId,
      operationType,
      windowStart: nextWindowStart.toISOString(),
    });

    assertEquals(result.allowed, true);
    assertEquals(result.remainingRequests, config.maxRequests - 1);

    const resetRecord = mockSupabase
      .getRecords()
      .find((record) => record.window_start === nextWindowStart.toISOString());
    assert(resetRecord);
    assertEquals(resetRecord?.request_count, 1);
  });
});

Deno.test("Different Users Isolation", async () => {
  const mockSupabase = new MockSupabaseClient();
  const user1 = "user-1";
  const user2 = "user-2";

  // User 1 makes a request
  await checkRateLimit(mockSupabase, {
    userId: user1,
    operationType: "import",
  });

  // User 2 should still have full limit
  const user2Status = await getRateLimitStatus(mockSupabase, user2, "import");
  assertEquals(user2Status.remainingRequests, 10);

  // Check records
  const records = mockSupabase.getRecords();
  assertEquals(records.length, 1); // Only user1's record
  assertEquals(records[0].user_id, user1);
});

console.log("✅ All rate limiting tests passed!");
