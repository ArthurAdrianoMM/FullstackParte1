# Vercel Deployment Guide

This guide will help you deploy your MongoDB Habits API to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. MongoDB Atlas account (for production database) or your MongoDB connection string
3. Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Prepare Your MongoDB Database

### ⚠️ Important: Localhost Won't Work with Vercel

**You cannot use `mongodb://localhost:27017/userauth` with Vercel** because:
- Vercel runs your code in the cloud (on their servers)
- `localhost` refers to Vercel's servers, not your computer
- Your local MongoDB is not accessible from the internet

### Options for MongoDB on Vercel

#### Option 1: MongoDB Atlas (Recommended - FREE)

MongoDB Atlas offers a free tier perfect for development:

1. **Sign up for MongoDB Atlas**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
   - Create a free account (M0 Free Tier)

2. **Create a Cluster**:
   - Choose a cloud provider (AWS, Google Cloud, or Azure)
   - Select a region close to you
   - Choose "M0 Sandbox" (FREE tier)
   - Click "Create Cluster" (takes 3-5 minutes)

3. **Create Database User**:
   - Go to "Database Access" → "Add New Database User"
   - Choose "Password" authentication
   - Username: `vercel-user` (or your choice)
   - Password: Generate a secure password (save it!)
   - Database User Privileges: "Atlas admin" or "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (adds `0.0.0.0/0`)
   - Or add Vercel's IP ranges (not necessary with `0.0.0.0/0`)
   - Click "Confirm"

5. **Get Connection String**:
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Driver: "Node.js", Version: "5.5 or later"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `userauth` (or your database name)
   - Example: `mongodb+srv://vercel-user:YourPassword@cluster0.xxxxx.mongodb.net/userauth?retryWrites=true&w=majority`

#### Option 2: Use Your Existing Cloud MongoDB

If you already have a MongoDB instance accessible from the internet (not localhost), use that connection string.

#### Option 3: Local Development Only

For local development, you can continue using `mongodb://localhost:27017/userauth` in your `.env` file. This will work when running `npm run dev` locally, but **not** on Vercel.

## Step 2: Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to Git**:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import project in Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your Git repository
   - Vercel will auto-detect the project settings

3. **Configure Environment Variables**:
   In the Vercel dashboard, go to your project → Settings → Environment Variables and add:
   
   | Variable | Description | Example |
   |----------|-------------|---------|
   | `MONGO_URI` | MongoDB connection string (MongoDB Atlas, NOT localhost) | `mongodb+srv://user:pass@cluster.mongodb.net/userauth` |
   | `DB_NAME` | Database name | `userauth` |
   | `JWT_SECRET` | Secret key for JWT (min 32 chars) | `your-super-secret-jwt-key-change-this-in-production` |
   | `JWT_EXPIRES_IN` | JWT expiration time | `1h` |
   | `CORS_ORIGIN` | Allowed CORS origins | `*` or `https://yourfrontend.com` |
   | `NODE_ENV` | Environment | `production` |
   | `BCRYPT_ROUNDS` | Bcrypt rounds | `10` |
   | `LOG_LEVEL` | Logging level | `info` |

4. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete

### Option B: Deploy via CLI

1. **Login to Vercel**:
   ```bash
   vercel login
   ```

2. **Deploy**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project or create new
   - Confirm project settings
   - Add environment variables when prompted

3. **Set Environment Variables**:
   ```bash
   vercel env add MONGO_URI
   vercel env add JWT_SECRET
   vercel env add DB_NAME
   vercel env add CORS_ORIGIN
   # ... add other variables as needed
   ```

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

## Step 4: Verify Deployment

1. **Check your deployment URL**:
   - Vercel will provide a URL like `https://your-project.vercel.app`
   - Test the health endpoint: `https://your-project.vercel.app/health`
   - Test the API: `https://your-project.vercel.app/api/habits`

2. **Test API endpoints**:
   ```bash
   # Health check
   curl https://your-project.vercel.app/health
   
   # Register user
   curl -X POST https://your-project.vercel.app/api/register \
     -H "Content-Type: application/json" \
     -d '{"username":"test","email":"test@example.com","password":"password123"}'
   ```

## Important Notes

### MongoDB Connection

- **Connection Pooling**: The API handler reuses MongoDB connections across serverless function invocations
- **Cold Starts**: First request may be slower due to MongoDB connection initialization
- **IP Whitelisting**: Make sure your MongoDB Atlas allows connections from Vercel's IP ranges (or use `0.0.0.0/0`)

### Environment Variables

- All environment variables must be set in Vercel dashboard
- Variables are encrypted and only available at runtime
- Update variables in: Project Settings → Environment Variables

### CORS Configuration

- Update `CORS_ORIGIN` to match your frontend domain
- For multiple origins, you may need to update the CORS configuration in `src/app.ts`

### Build Configuration

- Vercel automatically detects TypeScript and builds the project
- The `vercel.json` file configures the serverless function routing
- Build command: `npm run build` (runs `tsc`)
- Output directory: `dist/` (for local builds, but Vercel handles TypeScript directly)

## Troubleshooting

### Build Failures

1. **Check build logs** in Vercel dashboard
2. **Verify TypeScript compilation**:
   ```bash
   npm run build
   ```
3. **Check for missing dependencies** in `package.json`

### Runtime Errors

1. **Check function logs** in Vercel dashboard
2. **Verify environment variables** are set correctly
3. **Test MongoDB connection** separately
4. **Check CORS settings** if frontend can't access API

### MongoDB Connection Issues

1. **Verify connection string** format
   - Must be a cloud-hosted MongoDB (MongoDB Atlas, etc.)
   - **Cannot use `localhost`** - Vercel can't access your local machine
2. **Check IP whitelist** in MongoDB Atlas
   - Should include `0.0.0.0/0` or Vercel's IP ranges
3. **Verify database user** credentials
   - Username and password must match your Atlas database user
4. **Test connection** with MongoDB Compass or `mongosh`
   - Use the same connection string you set in Vercel
5. **Common Error: "ECONNREFUSED" or "Connection timeout"**
   - This usually means you're trying to use `localhost`
   - Switch to MongoDB Atlas or another cloud-hosted MongoDB

## Updating Your Deployment

1. **Push changes to Git**:
   ```bash
   git add .
   git commit -m "Update API"
   git push origin main
   ```

2. **Vercel automatically deploys** on push to main branch
3. **Or manually deploy**:
   ```bash
   vercel --prod
   ```

## Project Structure for Vercel

```
.
├── api/
│   └── index.ts          # Vercel serverless function handler
├── src/                   # Source TypeScript files
├── vercel.json           # Vercel configuration
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

