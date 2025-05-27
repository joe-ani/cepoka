# 🔍 Google Search Console Setup Guide for cepokabeautyhub.com

## Step 1: Access Google Search Console

1. **Go to Google Search Console**: [https://search.google.com/search-console/](https://search.google.com/search-console/)
2. **Sign in** with your Google account (use the same account you want to manage your website with)

## Step 2: Add Your Website

1. **Click "Add Property"** (or "Start Now" if it's your first time)
2. **Choose "URL prefix"** method (recommended for your setup)
3. **Enter your website URL**: `https://cepokabeautyhub.com`
4. **Click "Continue"**

## Step 3: Verify Ownership (HTML Tag Method - Recommended)

### Option A: HTML Tag Verification (Easiest)

1. **Select "HTML tag" method** from the verification options
2. **Copy the meta tag** that looks like this:
   ```html
   <meta name="google-site-verification" content="ABC123XYZ..." />
   ```
3. **Copy only the content value** (the part after `content="` and before the closing `"`)
4. **Update your website code**:
   - Open your project in VS Code
   - Go to `src/app/layout.tsx`
   - Find line 91 that says: `google: "your-google-verification-code"`
   - Replace `"your-google-verification-code"` with your actual verification code
   - Save the file

5. **Deploy your changes** to your live website
6. **Go back to Google Search Console** and click "Verify"

### Option B: HTML File Upload (Alternative)

1. **Download the HTML file** provided by Google
2. **Upload it to your website's root directory** (public folder)
3. **Make sure it's accessible** at `https://cepokabeautyhub.com/[filename].html`
4. **Click "Verify"** in Google Search Console

## Step 4: Submit Your Sitemap

1. **After verification**, go to "Sitemaps" in the left sidebar
2. **Add a new sitemap** with this URL: `https://cepokabeautyhub.com/sitemap.xml`
3. **Click "Submit"**

## Step 5: Request Indexing

1. **Go to "URL Inspection"** in the left sidebar
2. **Enter your homepage URL**: `https://cepokabeautyhub.com`
3. **Click "Request Indexing"** if it's not already indexed
4. **Repeat for important pages**:
   - `https://cepokabeautyhub.com/shop`
   - `https://cepokabeautyhub.com/contact`

## Step 6: Set Up Additional Properties (Optional but Recommended)

### Add www version:
1. **Add another property**: `https://www.cepokabeautyhub.com`
2. **Verify it** using the same method
3. **Set up 301 redirects** from www to non-www (or vice versa) in your hosting settings

### Add HTTP version:
1. **Add**: `http://cepokabeautyhub.com`
2. **Verify and set up HTTPS redirects**

## Step 7: Monitor and Optimize

### Weekly Tasks:
- **Check "Coverage" report** for indexing issues
- **Review "Performance" report** for search rankings
- **Monitor "Enhancements"** for mobile usability issues

### Monthly Tasks:
- **Submit new sitemaps** if you add new pages
- **Check "Security Issues"** tab
- **Review "Manual Actions"** (should be empty)

## 🎯 Expected Timeline for Results

- **Verification**: Immediate
- **Sitemap Processing**: 1-3 days
- **First Search Appearances**: 1-2 weeks
- **Full SEO Impact**: 4-12 weeks

## 🔧 Troubleshooting Common Issues

### Verification Failed:
- Make sure your website is live and accessible
- Check that the meta tag is in the `<head>` section
- Clear your browser cache and try again
- Wait 24 hours and retry

### Sitemap Not Found:
- Ensure your website is deployed with the sitemap.ts file
- Check that `https://cepokabeautyhub.com/sitemap.xml` loads in your browser
- Make sure there are no typos in the sitemap URL

### Pages Not Indexing:
- Check robots.txt isn't blocking pages
- Ensure pages are linked from your main navigation
- Submit individual URLs for indexing
- Wait patiently (can take weeks for new sites)

## 📊 Key Metrics to Track

1. **Impressions**: How often your site appears in search results
2. **Clicks**: How many people click through to your site
3. **Average Position**: Where your site ranks for different keywords
4. **Coverage**: How many of your pages are indexed by Google

## 🎯 Target Keywords to Monitor

Once set up, track these keywords in the Performance report:
- "Cepoka Beauty Hub"
- "spa equipment Lagos"
- "beauty equipment Nigeria"
- "salon furniture"
- "facial machines"
- "pedicure chairs"

## 📞 Need Help?

If you encounter any issues:
1. Check the Google Search Console Help Center
2. Ensure your website is fully deployed and accessible
3. Wait 24-48 hours between changes and verification attempts
4. Contact your web developer if technical issues persist

Your website is now fully optimized and ready for Google Search Console setup!
