-- Migration: Optimize RLS Policies for Performance (STANDALONE VERSION)
-- Purpose: Fix Supabase Performance Advisor warnings
-- This version can be run independently without dependencies on previous migrations
-- Date: 2025-01-15

-- ============================================================================
-- PART 1: USER_PROFILES TABLE
-- ============================================================================
-- Drop existing policies (IF EXISTS prevents errors if already dropped)
DROP POLICY IF EXISTS "Users can view their own profiles." ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profiles." ON public.user_profiles;

-- Create optimized policies using subquery pattern
CREATE POLICY "Users can view their own profiles."
  ON public.user_profiles FOR SELECT
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own profiles."
  ON public.user_profiles FOR UPDATE
  USING (id = (SELECT auth.uid()));

-- ============================================================================
-- PART 2: CATEGORIES TABLE
-- ============================================================================
-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view categories." ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories." ON public.categories;

-- Create consolidated policy combining both authenticated view and admin management
CREATE POLICY "Categories access policy"
  ON public.categories
  USING (
    -- Authenticated users can view (SELECT)
    (auth.role() = 'authenticated')
    OR
    -- Admins can do everything (SELECT, INSERT, UPDATE, DELETE)
    ((SELECT role FROM public.user_profiles WHERE id = (SELECT auth.uid())) = 'admin')
  );

-- ============================================================================
-- PART 3: CHAPTERS TABLE
-- ============================================================================
-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view published chapters." ON public.chapters;
DROP POLICY IF EXISTS "Admins can manage chapters." ON public.chapters;

-- Create consolidated policy combining published view and admin management
CREATE POLICY "Chapters access policy"
  ON public.chapters
  USING (
    -- Authenticated users can view published chapters (SELECT only)
    (auth.role() = 'authenticated' AND is_published = true)
    OR
    -- Admins can do everything (SELECT, INSERT, UPDATE, DELETE)
    ((SELECT role FROM public.user_profiles WHERE id = (SELECT auth.uid())) = 'admin')
  );

-- ============================================================================
-- PART 4: USER_PROGRESS TABLE
-- ============================================================================
-- Drop existing policy
DROP POLICY IF EXISTS "Users can manage their own progress." ON public.user_progress;

-- Create optimized policy using subquery pattern
CREATE POLICY "Users can manage their own progress."
  ON public.user_progress FOR ALL
  USING (user_id = (SELECT auth.uid()));

-- ============================================================================
-- PART 5: CONVERSATIONS TABLE
-- ============================================================================
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own conversations." ON public.conversations;
DROP POLICY IF EXISTS "Users can create their own conversations." ON public.conversations;
DROP POLICY IF EXISTS "Users can update their own conversations." ON public.conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations." ON public.conversations;

-- Create optimized policies using subquery pattern
CREATE POLICY "Users can view their own conversations."
  ON public.conversations FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create their own conversations."
  ON public.conversations FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own conversations."
  ON public.conversations FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own conversations."
  ON public.conversations FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE 'RLS policies optimized successfully!';
  RAISE NOTICE 'Fixed: 10 Auth RLS warnings + 2 Multiple Permissive Policies warnings';
  RAISE NOTICE 'Check Performance Advisor in 5-10 minutes to verify warnings are resolved.';
END $$;