# Deployment Guide - Vercel

**Last Updated:** 2025-10-03  
**Status:** Ready for production deployment  
**Platform:** Vercel (EU region)

---

## 🎯 **Pre-Deployment Checklist**

### **✅ Code Ready**
- [x] All features implemented
- [x] Design system complete
- [x] Testing complete (E2E + Performance)
- [x] Security verified
- [x] Documentation complete
- [x] All changes committed and pushed

### **✅ Environment Variables**
You'll need these in Vercel:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Services (Required)
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
```

### **✅ Monitoring Enabled**
- [x] Vercel Analytics installed
- [x] Speed Insights installed
- [x] Added to layout.tsx

---

## 🚀 **Deployment Steps**

### **Step 1: Install Vercel CLI** (Optional)
```bash
npm install -g vercel
```

### **Step 2: Login to Vercel**
```bash
vercel login
```

### **Step 3: Deploy**

#### **Option A: Via Vercel Dashboard** (Recommended)
1. Go to https://vercel.com/new
2. Import your GitHub repository: `Coda1977/Levelup5`
3. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Install Command:** `npm install --legacy-peer-deps`
   - **Output Directory:** `.next`

4. Add environment variables (see above)
5. Select region: **Frankfurt (fra1)** (EU)
6. Click **Deploy**

#### **Option B: Via CLI**
```bash
# First deployment
vercel

# Production deployment
vercel --prod
```

### **Step 4: Configure Environment Variables**

In Vercel Dashboard → Settings → Environment Variables:

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Value: Your Supabase project URL
   - Environments: Production, Preview, Development

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Value: Your Supabase anon key
   - Environments: Production, Preview, Development

3. **SUPABASE_SERVICE_ROLE_KEY**
   - Value: Your Supabase service role key
   - Environments: Production only (security)

4. **ANTHROPIC_API_KEY**
   - Value: Your Anthropic API key
   - Environments: Production, Preview

5. **OPENAI_API_KEY**
   - Value: Your OpenAI API key
   - Environments: Production, Preview

### **Step 5: Configure Domain** (Optional)
1. Go to Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

---

## 📊 **Monitoring Setup**

### **Vercel Analytics** (Included)

**What it tracks:**
- Page views
- Unique visitors
- Top pages
- Traffic sources
- Geographic distribution

**How to access:**
1. Go to your project in Vercel
2. Click "Analytics" tab
3. View real-time and historical data

**No configuration needed** - Already added to [`layout.tsx`](../src/app/layout.tsx)

### **Speed Insights** (Included)

**What it tracks:**
- Core Web Vitals (LCP, FID, CLS)
- Real user performance
- Performance score
- Slow pages

**How to access:**
1. Go to your project in Vercel
2. Click "Speed Insights" tab
3. View performance metrics

**No configuration needed** - Already added to [`layout.tsx`](../src/app/layout.tsx)

---

## 🔒 **Security Configuration**

### **Headers** (Configured in [`vercel.json`](../vercel.json))

```json
{
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin"
}
```

These headers protect against:
- ✅ MIME type sniffing attacks
- ✅ Clickjacking
- ✅ XSS attacks
- ✅ Information leakage

### **Environment Variables**

**Security best practices:**
- ✅ Service role key only in production
- ✅ Never commit secrets to git
- ✅ Use Vercel's encrypted storage
- ✅ Rotate keys if compromised

---

## 🎯 **Post-Deployment Checklist**

### **Immediate (First Hour)**
- [ ] Visit production URL
- [ ] Test scroll storytelling on landing page
- [ ] Sign up with test account
- [ ] Browse learn page
- [ ] Test chat functionality
- [ ] Verify TTS audio playback
- [ ] Check admin panel (if admin)
- [ ] Test on mobile device

### **First Day**
- [ ] Monitor Analytics for traffic
- [ ] Check Speed Insights scores
- [ ] Review any errors in logs
- [ ] Test from different locations
- [ ] Verify email confirmations work
- [ ] Check database connections

### **First Week**
- [ ] Review user behavior in Analytics
- [ ] Check Core Web Vitals scores
- [ ] Monitor error rates
- [ ] Collect user feedback
- [ ] Plan any needed improvements

---

## 📈 **Monitoring Dashboards**

### **Vercel Analytics**
**URL:** https://vercel.com/[your-team]/levelup5/analytics

**Key Metrics to Watch:**
- **Page Views:** Total visits
- **Unique Visitors:** Individual users
- **Top Pages:** Most visited pages
- **Traffic Sources:** Where users come from
- **Devices:** Desktop vs Mobile

**Targets:**
- Growing page views
- Increasing unique visitors
- High engagement (multiple pages per visit)

### **Speed Insights**
**URL:** https://vercel.com/[your-team]/levelup5/speed-insights

**Key Metrics to Watch:**
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **Overall Score:** > 90

**Targets:**
- All metrics in "Good" range
- Score > 90 (Excellent)
- No degradation over time

### **Vercel Logs**
**URL:** https://vercel.com/[your-team]/levelup5/logs

**What to monitor:**
- Error logs (500 errors)
- Warning logs
- Build logs
- Function execution times

**Action items:**
- Investigate any 500 errors immediately
- Review warnings weekly
- Monitor function timeouts

---

## 🔧 **Troubleshooting**

### **Build Fails**
```bash
# Check build locally first
npm run build

# If it works locally but fails on Vercel:
# - Check environment variables
# - Verify install command uses --legacy-peer-deps
# - Check Node.js version (should be 20+)
```

### **Environment Variables Not Working**
1. Verify they're set in Vercel dashboard
2. Check they're assigned to correct environments
3. Redeploy after adding variables
4. Check for typos in variable names

### **Slow Performance**
1. Check Speed Insights for bottlenecks
2. Review database query performance
3. Check for large bundle sizes
4. Consider adding caching

### **Errors in Production**
1. Check Vercel logs
2. Look for patterns (specific pages, times)
3. Test locally with production data
4. Deploy fix and verify

---

## 📊 **Success Metrics**

### **Week 1 Targets:**
- **Uptime:** > 99.9%
- **Error Rate:** < 0.1%
- **Page Load Time:** < 2s (p95)
- **User Signups:** Track baseline

### **Month 1 Targets:**
- **Active Users:** Growing
- **Engagement:** Multiple sessions per user
- **Performance Score:** > 90
- **No critical bugs**

---

## 🎯 **Deployment Commands**

### **Deploy to Production**
```bash
# Via CLI
vercel --prod

# Or push to main branch (auto-deploy if configured)
git push origin main
```

### **Deploy Preview**
```bash
# Via CLI
vercel

# Or create PR (auto-preview)
```

### **Rollback**
```bash
# Via dashboard: Deployments → Previous → Promote to Production
# Or via CLI:
vercel rollback
```

---

## 📝 **Post-Deployment Tasks**

### **Immediate:**
1. ✅ Verify deployment successful
2. ✅ Test all critical flows
3. ✅ Check monitoring dashboards
4. ✅ Announce to team/users

### **First Week:**
1. 📊 Monitor analytics daily
2. 🐛 Fix any issues found
3. 📈 Track user growth
4. 💬 Collect feedback

### **Ongoing:**
1. 📊 Review metrics weekly
2. 🔄 Deploy improvements
3. 📈 Optimize based on data
4. 🎯 Plan new features

---

## 🎉 **You're Ready!**

Everything is configured for deployment:
- ✅ Monitoring installed
- ✅ vercel.json configured
- ✅ Security headers set
- ✅ EU region selected
- ✅ Performance verified

**Next step:** Deploy via Vercel dashboard or CLI!

---

**Created:** 2025-10-03  
**Status:** Ready for production deployment  
**Region:** Frankfurt (fra1) - EU