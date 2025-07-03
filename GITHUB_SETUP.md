# GitHub Setup Guide

This guide will help you set up this project on GitHub while ensuring all sensitive files and credentials are properly excluded.

## Pre-Setup Checklist

Before pushing to GitHub, ensure you have:

1. ✅ **Updated `.gitignore`** - All sensitive files are excluded
2. ✅ **No `.env.local` file** - Environment variables are not committed
3. ✅ **No API keys in code** - All credentials are in environment variables
4. ✅ **README.md updated** - Project documentation is complete

## Environment Variables Required

Create a `.env.local` file in your project root with the following variables:

```bash
# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id_here
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_api_token_here
SANITY_API_ADMIN_TOKEN=your_sanity_admin_token_here
SANITY_API_WRITE_TOKEN=your_sanity_write_token_here

# OpenAI (for AI features)
OPENAI_API_KEY=your_openai_api_key_here

# Pusher (for real-time chat)
PUSHER_APP_ID=your_pusher_app_id_here
PUSHER_KEY=your_pusher_key_here
PUSHER_SECRET=your_pusher_secret_here
PUSHER_CLUSTER=your_pusher_cluster_here

# Weather API (optional)
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key_here

# Vercel (for production)
VERCEL_PROJECT_PRODUCTION_URL=your_vercel_url_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Development
NODE_ENV=development
```

## GitHub Repository Setup

### 1. Initialize Git Repository

```bash
# Initialize git repository
git init

# Add all files (except those in .gitignore)
git add .

# Make initial commit
git commit -m "Initial commit: Campus Connect Reddit Clone"

# Add GitHub remote (replace with your repository URL)
git remote add origin https://github.com/yourusername/campus-connect-reddit-clone.git

# Push to GitHub
git push -u origin main
```

### 2. Verify Sensitive Files Are Excluded

Before pushing, verify these files are NOT tracked:

```bash
# Check what files will be committed
git status

# Should NOT see any of these files:
# - .env.local
# - .env.production
# - sanity.cli.ts
# - sanity.config.ts
# - Any .key, .pem, or credential files
```

### 3. GitHub Repository Settings

After creating your repository on GitHub:

1. **Go to Settings > Secrets and variables > Actions**
2. **Add repository secrets** for production deployment:
   - `CLERK_SECRET_KEY`
   - `SANITY_API_TOKEN`
   - `SANITY_API_ADMIN_TOKEN`
   - `SANITY_API_WRITE_TOKEN`
   - `OPENAI_API_KEY`
   - `PUSHER_APP_ID`
   - `PUSHER_KEY`
   - `PUSHER_SECRET`
   - `PUSHER_CLUSTER`

### 4. Branch Protection (Recommended)

Set up branch protection rules:

1. **Go to Settings > Branches**
2. **Add rule for `main` branch**
3. **Enable:**
   - Require pull request reviews
   - Require status checks to pass
   - Include administrators

## Deployment Setup

### Vercel Deployment

1. **Connect your GitHub repository to Vercel**
2. **Add environment variables** in Vercel dashboard
3. **Deploy automatically** on push to main branch

### Environment Variables for Production

Make sure to add all environment variables in your deployment platform (Vercel, Netlify, etc.)

## Security Best Practices

1. **Never commit `.env.local`** - Always use `.gitignore`
2. **Use environment variables** - Never hardcode API keys
3. **Rotate keys regularly** - Update API keys periodically
4. **Use different keys** - Separate development and production keys
5. **Monitor access** - Regularly check API usage and access logs

## Troubleshooting

### If sensitive files are accidentally committed:

```bash
# Remove from git tracking (but keep local file)
git rm --cached .env.local

# Commit the removal
git commit -m "Remove sensitive files from tracking"

# Push changes
git push
```

### If you need to update .gitignore:

```bash
# Remove cached files that should be ignored
git rm -r --cached .
git add .
git commit -m "Update .gitignore and remove cached files"
git push
```

## Next Steps

After setting up GitHub:

1. **Set up CI/CD** - Configure automated testing and deployment
2. **Add collaborators** - Invite team members if needed
3. **Set up monitoring** - Configure error tracking and analytics
4. **Document API** - Create API documentation if needed

---

**Remember:** Always keep your environment variables secure and never share them publicly! 