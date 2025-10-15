-- Migration: Fix Remaining RLS Performance Warnings
-- Purpose: Address the 4 remaining "Auth RLS Initialization Plan" warnings
-- The issue: Even with subqueries, some patterns still trigger warnings
-- Solution: Use security definer functions for stable evaluation
-- Date: 2025-01-15

-- ============================================================================
-- PART 1: Create helper function for stable auth.uid() evaluation
-- ============================================================================
-- This function is marked as STABLE which tells Postgres it can cache the result
-- within a single query, preventing re-evaluation for each row
CREATE OR REPLACE FUNCTION auth.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid();
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION auth.current_user_id() TO authenticated;

-- ============================================================================
-- PART 2: Fix CATEGORIES policies
-- ============================================================================
DROP POLICY IF EXISTS "Categories access policy" ON public.categories;

-- Split into separate policies for better performance
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
    (SELECT role FROM public.user_profiles WHERE id = auth.current_user_id()) = 'admin'
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
    (SELECT role FROM public.user_profiles WHERE id = auth.current_user_id()) = 'admin'
  );

-- ============================================================================
-- PART 4: Fix MESSAGES policies (the tricky one with EXISTS)
-- ============================================================================
DROP POLICY IF EXISTS "Users can view messages in their conversations." ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations." ON public.messages;

-- Use the stable function in the EXISTS clause
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.current_user_id()
    )
  );

CREATE POLICY "Users can create messages in their conversations"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.current_user_id()
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
  RAISE NOTICE 'Created: auth.current_user_id() helper function';
  RAISE NOTICE 'Updated: categories policies (split for clarity)';
  RAISE NOTICE 'Updated: chapters policies (split for clarity)';
  RAISE NOTICE 'Updated: messages policies (using stable function)';
  RAISE NOTICE '';
  RAISE NOTICE 'Wait 5-10 minutes, then check Performance Advisor';
  RAISE NOTICE 'Expected: All Auth RLS warnings should be resolved';
  RAISE NOTICE '========================================';
END $$;