-- Harden the delete_user() function by setting a fixed search_path and restricting execution to authenticated users only
-- This addresses the security warning about SECURITY DEFINER functions without fixed search_path

-- Recreate the function with a fixed search_path to prevent search_path attacks
CREATE OR REPLACE FUNCTION "public"."delete_user"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET search_path = pg_catalog
    AS $$
BEGIN
  -- Delete the current authenticated user from auth.users
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

-- Tighten permissions: revoke all access from anonymous users
REVOKE ALL ON FUNCTION public.delete_user() FROM anon;

-- Ensure only authenticated users can execute this function
REVOKE ALL ON FUNCTION public.delete_user() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user() TO authenticated;