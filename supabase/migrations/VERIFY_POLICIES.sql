-- Verification Query: Check All RLS Policies
-- Run this in Supabase Dashboard SQL Editor to verify the migration was successful

-- ============================================================================
-- PART 1: List all policies with their details
-- ============================================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as operation,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- PART 2: Count policies per table (should match expected counts)
-- ============================================================================
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Expected Results:
-- categories: 1 policy (consolidated)
-- chapters: 1 policy (consolidated)
-- conversations: 4 policies (select, insert, update, delete)
-- messages: 2 policies (select, insert)
-- user_profiles: 2 policies (select, update)
-- user_progress: 1 policy (all operations)

-- ============================================================================
-- PART 3: Check for optimized patterns (should use subquery pattern)
-- ============================================================================
-- This checks if policies use the optimized (SELECT auth.uid()) pattern
SELECT 
  tablename,
  policyname,
  CASE 
    WHEN qual::text LIKE '%(SELECT auth.uid())%' THEN '✅ Optimized'
    WHEN qual::text LIKE '%auth.uid()%' THEN '⚠️ Not Optimized'
    ELSE '✓ Other pattern'
  END as optimization_status,
  qual::text as policy_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- PART 4: Summary Report
-- ============================================================================
DO $$
DECLARE
  total_policies INTEGER;
  optimized_policies INTEGER;
  categories_count INTEGER;
  chapters_count INTEGER;
BEGIN
  -- Count total policies
  SELECT COUNT(*) INTO total_policies
  FROM pg_policies
  WHERE schemaname = 'public';
  
  -- Count optimized policies (using subquery pattern)
  SELECT COUNT(*) INTO optimized_policies
  FROM pg_policies
  WHERE schemaname = 'public'
    AND qual::text LIKE '%(SELECT auth.uid())%';
  
  -- Check consolidated policies
  SELECT COUNT(*) INTO categories_count
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'categories';
  
  SELECT COUNT(*) INTO chapters_count
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'chapters';
  
  -- Print summary
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RLS POLICY VERIFICATION SUMMARY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total policies: %', total_policies;
  RAISE NOTICE 'Optimized policies: %', optimized_policies;
  RAISE NOTICE '';
  RAISE NOTICE 'Consolidated Policies:';
  RAISE NOTICE '  - categories: % (expected: 1)', categories_count;
  RAISE NOTICE '  - chapters: % (expected: 1)', chapters_count;
  RAISE NOTICE '';
  
  IF categories_count = 1 AND chapters_count = 1 THEN
    RAISE NOTICE '✅ Policy consolidation successful!';
  ELSE
    RAISE NOTICE '⚠️ Policy consolidation may need review';
  END IF;
  
  IF optimized_policies >= 8 THEN
    RAISE NOTICE '✅ Policy optimization successful!';
  ELSE
    RAISE NOTICE '⚠️ Some policies may not be optimized';
  END IF;
  
  RAISE NOTICE '========================================';
END $$;