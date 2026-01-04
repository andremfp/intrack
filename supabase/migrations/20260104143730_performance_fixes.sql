-- Performance fixes for RLS policies and missing indexes
-- Addresses Supabase dashboard warnings for optimal query performance

-- ==========================================
-- RLS Policy Performance Fixes
-- ==========================================
-- Replace auth.uid() calls with (select auth.uid()) to avoid re-evaluation per row

-- Drop existing consultations policies (will be recreated)
DROP POLICY IF EXISTS "consultations_self_delete" ON "public"."consultations";
DROP POLICY IF EXISTS "consultations_self_insert" ON "public"."consultations";
DROP POLICY IF EXISTS "consultations_self_read" ON "public"."consultations";
DROP POLICY IF EXISTS "consultations_self_update" ON "public"."consultations";

-- Recreate consultations policies with optimized auth.uid() calls
CREATE POLICY "consultations_self_delete" ON "public"."consultations"
    FOR DELETE USING ((select auth.uid()) = "user_id");

CREATE POLICY "consultations_self_insert" ON "public"."consultations"
    FOR INSERT WITH CHECK ((select auth.uid()) = "user_id");

CREATE POLICY "consultations_self_read" ON "public"."consultations"
    FOR SELECT USING ((select auth.uid()) = "user_id");

CREATE POLICY "consultations_self_update" ON "public"."consultations"
    FOR UPDATE USING ((select auth.uid()) = "user_id");

-- Drop existing users policies (will be recreated)
DROP POLICY IF EXISTS "users_self_read" ON "public"."users";
DROP POLICY IF EXISTS "users_self_update" ON "public"."users";
DROP POLICY IF EXISTS "users_self_upsert" ON "public"."users";

-- Recreate users policies with optimized auth.uid() calls
CREATE POLICY "users_self_read" ON "public"."users"
    FOR SELECT USING ((select auth.uid()) = "user_id");

CREATE POLICY "users_self_update" ON "public"."users"
    FOR UPDATE USING ((select auth.uid()) = "user_id");

CREATE POLICY "users_self_upsert" ON "public"."users"
    FOR INSERT WITH CHECK ((select auth.uid()) = "user_id");

-- ==========================================
-- Missing Index Fixes
-- ==========================================
-- Add covering indexes for foreign keys to improve query performance

-- Index for consultations.user_id foreign key (missing covering index)
CREATE INDEX IF NOT EXISTS "idx_consultations_user_id" ON "public"."consultations" USING "btree" ("user_id");

-- Index for users.specialty_id foreign key (missing covering index)
CREATE INDEX IF NOT EXISTS "idx_users_specialty_id" ON "public"."users" USING "btree" ("specialty_id");

-- Note: users.user_id already has a primary key index, so no additional index needed
