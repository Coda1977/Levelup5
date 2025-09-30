
# LevelUp5 - Manual Testing Guide

**Purpose:** Complete Phase 1 testing with authenticated user scenarios  
**Prerequisites:** Automated tests completed (8/8 passed)  
**Estimated Time:** 1-2 hours  
**Tester:** Project Owner

---

## 🎯 Testing Objectives

This guide will help you complete the critical manual tests that require:
1. Email confirmation
2. Authenticated user sessions
3. Admin role privileges
4. Security vulnerability testing

---

## 📋 Pre-Testing Setup

### Step 1: Confirm Test User Email
1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to your project
3. Go to **Authentication** → **Users**
4. Find user: `testuser@levelup5.com`
5. Click on the user
6. Click **"Confirm Email"** button
7. User status should change to "Confirmed"

### Step 2: Create Admin User
1. In Supabase Dashboard, go to **SQL Editor**
2. Run this query to promote test user to admin:
```sql
UPDATE public.user_profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'testuser@levelup5.com'
);
```
3. Verify the update:
```sql
SELECT u.email, p.role 
FROM auth.users u
JOIN public.user_profiles p ON u.id = p.id
WHERE u.email = 'testuser@levelup5.com';
```
4. Should show: `testuser@levelup5.com | admin`

### Step 3: Prepare Test Environment
- ✅ Dev server running: `npm run dev`
- ✅ Database seeded with demo content
- ✅ Browser ready (Chrome/Firefox recommended)
- ✅ Notepad ready for documenting results

---

## 🧪 Manual Test Suite

### Test 1.2: User Login Flow
**Priority:** CRITICAL  
**Time:** 10 minutes

#### Steps:
1. Navigate to: http://localhost:3000/auth/login
2. Enter email: `testuser@levelup5.com`
3. Enter password: `TestPassword123!`
4. Click "Sign in"
5. **Expected:** Redirect to `/learn` page
6. Verify you see the learn page with chapters
7. Refresh the page (F5)
8. **Expected:** Still logged in, no redirect to login
9. Open DevTools → Application → Cookies
10. **Expected:** See Supabase auth cookies

#### Success Criteria:
- [ ] Login successful with valid credentials
- [ ] Redirected to learn page
- [ ] Session persists across page refresh
- [ ] Auth cookies present in browser

#### Document Results:
```
Status: [ ] PASS / [ ] FAIL
Issues Found: 
Notes:
```

---

### Test 1.3: Admin Panel Access
**Priority:** CRITICAL  
**Time:** 5 minutes

#### Steps:
1. While logged in as admin, navigate to: http://localhost:3000/admin
2. **Expected:** Admin dashboard loads (not redirected to login)
3. Verify you see:
   - "Admin Dashboard" heading
   - Tabs: "Chapters" and "Categories"
   - Forms for creating content
   - List of existing chapters/categories
4. Check browser console for errors

#### Success Criteria:
- [ ] Admin panel accessible
- [ ] Dashboard displays correctly
- [ ] Both tabs visible
- [ ] No console errors

#### Document Results:
```
Status: [ ] PASS / [ ] FAIL
Issues Found:
Notes:
```

---

### Test 2.1: Mark Chapter as Complete
**Priority:** CRITICAL  
**Time:** 10 minutes

#### Steps:
1. Navigate to: http://localhost:3000/learn
2. Click on "What Is Good Management?" chapter
3. Scroll down to find "Mark as Complete" button
4. Click the button
5. **Expected:** Button changes to "✓ Completed" with green background
6. Wait 2 seconds for API call
7. Navigate back to learn page
8. **Expected:** Green checkmark badge appears on the chapter card
9. **Expected:** Status changes from "Published" to "Completed"
10. Refresh the page
11. **Expected:** Checkmark still visible (persistence)

#### Success Criteria:
- [ ] Button toggles state immediately
- [ ] API call successful (check Network tab)
- [ ] Completion badge appears on learn page
- [ ] Progress persists after refresh
- [ ] No errors in console

#### Document Results:
```
Status: [ ] PASS / [ ] FAIL
Issues Found:
Notes:
```

---

### Test 2.2: Unmark Chapter Completion
**Priority:** HIGH  
**Time:** 5 minutes

#### Steps:
1. Navigate to the completed chapter
2. Click "✓ Completed" button
3. **Expected:** Button changes back to "Mark as Complete" (yellow)
4. Navigate to learn page
5. **Expected:** Checkmark badge removed
6. **Expected:** Status back to "Published"
7. Refresh page
8. **Expected:** Change persists

#### Success Criteria:
- [ ] Button toggles back to incomplete
- [ ] Badge removed from learn page
- [ ] Change persists after refresh
- [ ] No errors

#### Document Results:
```
Status: [ ] PASS / [ ] FAIL
Issues Found:
Notes:
```

---

### Test 3.1: Create Category (Admin)
**Priority:** HIGH  
**Time:** 10 minutes

#### Steps:
1. Navigate to: http://localhost:3000/admin
2. Click "Categories" tab
3. In the "Create New Category" form:
   - Title: `Leadership Skills`
   - Display Order: `3`
4. Click "Create Category"
5. **Expected:** Success alert appears
6. **Expected:** Category appears in "Existing Categories" list
7. Navigate to learn page
8. **Expected:** New category visible (if it has chapters)

#### Success Criteria:
- [ ] Category created successfully
- [ ] Success message displayed
- [ ] Category appears in admin list
- [ ] No errors in console

#### Document Results:
```
Status: [ ] PASS / [ ] FAIL
Category ID created:
Issues Found:
Notes:
```

---

### Test 3.2: Create Chapter (Admin)
**Priority:** HIGH  
**Time:** 15 minutes

#### Steps:
1. In admin panel, click "Chapters" tab
2. In the "Create New Chapter" form:
   - Title: `Effective Delegation`
   - Category: Select "Leadership Skills" (or "Foundations")
   - Content (HTML):
   ```html
   <h2>Effective Delegation</h2>
   <p>Delegation is a critical management skill that empowers teams.</p>
   <ul>
     <li>Identify the right tasks to delegate</li>
     <li>Choose the right person</li>
     <li>Provide clear instructions</li>
     <li>Follow up appropriately</li>
   </ul>
   ```
   - Display Order: `3`
   - Check "Published"
3. Click "Create Chapter"
4. **Expected:** Success alert
5. **Expected:** Chapter appears in list
6. Navigate to learn page
7. **Expected:** New chapter visible under selected category
8. Click on the new chapter
9. **Expected:** Content renders correctly with sanitized HTML

#### Success Criteria:
- [ ] Chapter created successfully
- [ ] Appears in admin list
- [ ] Visible on learn page
- [ ] Content renders correctly
- [ ] HTML properly sanitized

#### Document Results:
```
Status: [ ] PASS / [ ] FAIL
Chapter ID created:
Issues Found:
Notes:
```

---

### Test 3.3: Edit Chapter (Admin)
**Priority:** HIGH  
**Time:** 10 minutes

#### Steps:
1. In admin panel, Chapters tab
2. Find the chapter you just created
3. Click "Edit" button
4. Modify the title to: `Effective Delegation (Updated)`
5. Modify content: Add a