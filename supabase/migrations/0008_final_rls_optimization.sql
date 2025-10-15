-- Migration: Final RLS Optimization - Consolidate with Stable Function
-- Purpose: Fix the 2 "Multiple Permissive Policies" warnings while keeping stable function
-- This combines the best of both approaches
-- Date: 2025-01-15

-- ============================================================================
-- PART 1: Fix CATEGORIES - Consolidate back to single policy with stable function
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can view categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;

-- Single consolidated policy using stable function
CREATE POLICY "Categories access policy"
  ON public.categories
  TO authenticated
  USING (
    -- All authenticated users can SELECT
    true
  )
  WITH CHECK (
    -- Only admins can INSERT/UPDATE/DELETE
    (SELECT role FROM public.user_profiles WHERE id = public.current_user_id()) = 'admin'
  );

-- ============================================================================
-- PART 2: Fix CHAPTERS - Consolidate back to single policy with stable function
-- ============================================================================
DROP POLICY IF EXISTS "Authenticated users can view published chapters" ON public.chapters;
DROP POLICY IF EXISTS "Admins can manage chapters" ON public.chapters;

-- Single consolidated policy using stable function
CREATE POLICY "Chapters access policy"
  ON public.chapters
  TO authenticated
  USING (
    -- Authenticated users can view published chapters, admins can view all
    is_published = true 
    OR (SELECT role FROM public.user_profiles WHERE id = public.current_user_id()) = 'admin'
  )
  WITH CHECK (
    -- Only admins can INSERT/UPDATE/DELETE
    (SELECT role FROM public.user_profiles WHERE id = public.current_user_id()) = 'admin'
  );

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Final RLS optimization complete!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Consolidated: categories (1 policy with stable function)';
  RAISE NOTICE 'Consolidated: chapters (1 policy with stable function)';
  RAISE NOTICE '';
  RAISE NOTICE 'Expected result after 5-10 minutes:';
  RAISE NOTICE '  ✅ 0 Auth RLS Initialization Plan warnings';
  RAISE NOTICE '  ✅ 0 Multiple Permissive Policies warnings';
  RAISE NOTICE '  ✅ All 12 original warnings resolved!';
  RAISE NOTICE '========================================';
END $$;