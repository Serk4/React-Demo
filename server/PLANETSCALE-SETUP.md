# PlanetScale MySQL Setup for Vercel

## Step 1: Create PlanetScale Account

1. Visit https://planetscale.com/
2. Sign up with GitHub (recommended for easy integration)
3. Create a new database (choose a name like `react-demo`)

## Step 2: Get Connection String

1. Go to your database dashboard
2. Click "Connect"
3. Select "Connect with: MySQL2"
4. Copy the connection details

## Step 3: Add Environment Variables to Vercel

Go to your Vercel dashboard and add these environment variables:

### For your backend project (server):

- `MYSQL_HOST` = your-database-host.psdb.cloud
- `MYSQL_USER` = your-username
- `MYSQL_PASSWORD` = your-password
- `MYSQL_DATABASE` = react-demo (or your db name)
- `MYSQL_PORT` = 3306

### How to add in Vercel:

1. Go to https://vercel.com/dashboard
2. Select your backend project (`server`)
3. Go to Settings → Environment Variables
4. Add each variable above

## Step 4: Deploy Updated Backend

After adding the environment variables:

1. Push your code to GitHub (triggers auto-deploy)
2. Or manually deploy: `vercel --prod` from the server directory

## Alternative: Railway MySQL

If you prefer Railway:

1. Visit https://railway.app/
2. Create account and new project
3. Add MySQL database
4. Copy connection details to Vercel environment variables

## Testing the Production Setup

After deployment, your API will:

- Use MySQL in production (with persistent data)
- Use in-memory fallback locally (until you install MySQL)
- Automatically create tables and sample data on first run

The beauty of this setup is that it works everywhere:

- ✅ Local development (fallback mode)
- ✅ Vercel production (MySQL mode)
- ✅ Easy to switch databases later
