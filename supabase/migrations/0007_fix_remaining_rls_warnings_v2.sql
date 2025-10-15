-- Migration: Fix Remaining RLS Performance Warnings (v2)
-- Purpose: Address the 4 remaining "Auth RLS Initialization Plan" warnings
-- Solution: Use security definer function in public schema for stable evaluation
-- Date: 2025-01-15

-- ============================================================================
-- PART 1: Create helper function for stable auth.uid() evaluation
-- ============================================================================
-- Create in public schema (we don't have permission for auth schema)
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid();
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.current_user_id() TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.current_user_id() IS 
  'Stable wrapper for auth.uid() to prevent row-by-row re-evaluation in RLS policies';

-- ============================================================================
-- PART 2: Fix CATEGORIES policies
-- ============================================================================
DROP POLICY IF EXISTS "Categories access policy" ON public.categories;

-- SELECT policy for authenticated users
CREATE POLICY "Authenticated users can view categories"
  ON public.categories FOR SELECT
  TO authenticated
  USING (true);

-- ALL policy for admins only
CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM public.user_profiles WHERE id = public.current_user_id()) = 'admin'
  );

-- ============================================================================
-- PART 3: Fix CHAPTERS policies
-- ============================================================================
DROP POLICY IF EXISTS "Chapters access policy" ON public.chapters;

-- SELECT policy for authenticated users (published chapters only)
CREATE POLICY "Authenticated users can view published chapters"
  ON public.chapters FOR SELECT
  TO authenticated
  USING (is_published = true);

-- ALL policy for admins
CREATE POLICY "Admins can manage chapters"
  ON public.chapters FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM public.user_profiles WHERE id = public.current_user_id()) = 'admin'
  );

-- ============================================================================
-- PART 4: Fix MESSAGES policies
-- ============================================================================
DROP POLICY IF EXISTS "Users can view messages in their conversations." ON public.messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations." ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.messages;

-- Use the stable function in the EXISTS clause
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = public.current_user_id()
    )
  );

CREATE POLICY "Users can create messages in their conversations"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = public.current_user_id()
    )
  );

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Additional RLS optimizations applied!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Created: public.current_user_id() helper function';
  RAISE NOTICE 'Updated: categories policies (2 policies)';
  RAISE NOTICE 'Updated: chapters policies (2 policies)';
  RAISE NOTICE 'Updated: messages policies (2 policies)';
  RAISE NOTICE '';
  RAISE NOTICE 'Wait 5-10 minutes, then check Performance Advisor';
  RAISE NOTICE 'Expected: All 4 remaining Auth RLS warnings resolved';
  RAISE NOTICE '========================================';
END $$;