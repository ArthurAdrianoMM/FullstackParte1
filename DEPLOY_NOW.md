# Quick Deployment Guide to Vercel

## Step 1: Prepare Your Code

1. **Make sure your code is committed to Git**:
   ```bash
   git status
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

## Step 2: Deploy via Vercel Dashboard (Easiest Method)

### 2.1 Import Your Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Sign in with GitHub/GitLab/Bitbucket (or create an account)
3. Click "Import" next to your repository
4. Vercel will auto-detect your project settings

### 2.2 Configure Environment Variables

**IMPORTANT**: Before deploying, add these environment variables in Vercel:

1. In the Vercel import screen, click "Environment Variables" (or go to Project Settings → Environment Variables after import)

2. Add each variable:

   | Variable Name | Value | Notes |
   |--------------|-------|-------|
   | `MONGO_URI` | `mongodb+srv://master:1@cluster0.tf835qx.mongodb.net/userauth?retryWrites=true&w=majority&appName=Cluster0` | Your MongoDB Atlas connection string (added `/userauth` for database name) |
   | `DB_NAME` | `userauth` | Database name |
   | `JWT_SECRET` | `your-super-secret-jwt-key-change-this-must-be-at-least-32-characters-long` | **Change this!** Use a random string, at least 32 characters |
   | `JWT_EXPIRES_IN` | `1h` | JWT token expiration |
   | `CORS_ORIGIN` | `*` | Or your frontend URL like `https://yourfrontend.com` |
   | `NODE_ENV` | `production` | Environment setting |
   | `BCRYPT_ROUNDS` | `10` | Bcrypt hashing rounds |
   | `LOG_LEVEL` | `info` | Logging level |

3. **Make sure to select "Production", "Preview", and "Development"** for each variable (or at least "Production")

### 2.3 Deploy

1. Click "Deploy" button
2. Wait for the build to complete (usually 1-3 minutes)
3. You'll see a success message with your deployment URL

## Step 3: Test Your Deployment

Once deployed, you'll get a URL like: `https://your-project-name.vercel.app`

### Test the API:

```bash
# Health check
curl https://your-project-name.vercel.app/health

# Should return:
# {"status":"OK","timestamp":"...","uptime":...,"environment":"production"}
```

```bash
# Test endpoint
curl https://your-project-name.vercel.app/test

# Should return:
# {"message":"Server is working!","timestamp":"...","environment":"production"}
```

```bash
# Register a user (example)
curl -X POST https://your-project-name.vercel.app/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

## Step 4: Verify MongoDB Connection

1. Go to your Vercel project dashboard
2. Click on "Functions" tab
3. Make a request to your API
4. Check the "Logs" tab to see if MongoDB connected successfully
5. Look for: "Successfully connected to MongoDB" in the logs

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Make sure all dependencies are in `package.json`
- Verify TypeScript compiles: `npm run build`

### API Returns 500 Error
- Check function logs in Vercel dashboard
- Verify all environment variables are set correctly
- Check MongoDB Atlas network access (should allow `0.0.0.0/0`)

### MongoDB Connection Fails
- Verify `MONGO_URI` is correct in Vercel environment variables
- Check MongoDB Atlas → Network Access → IP Whitelist (should include `0.0.0.0/0`)
- Verify database user credentials in MongoDB Atlas

## Alternative: Deploy via CLI

If you prefer command line:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (first time - will ask questions)
vercel

# Set environment variables
vercel env add MONGO_URI
# Paste: mongodb+srv://master:1@cluster0.tf835qx.mongodb.net/userauth?retryWrites=true&w=majority&appName=Cluster0

vercel env add DB_NAME
# Paste: userauth

vercel env add JWT_SECRET
# Paste your secret (at least 32 chars)

vercel env add CORS_ORIGIN
# Paste: *

vercel env add NODE_ENV
# Paste: production

# Deploy to production
vercel --prod
```

## Next Steps

- Your API is now live! 🎉
- Use the Vercel URL in your frontend application
- Monitor logs in Vercel dashboard
- Set up custom domain (optional) in Vercel project settings

