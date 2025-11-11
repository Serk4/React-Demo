# MySQL Setup Guide

## Option 1: Install MySQL Server (Recommended for development)

### Windows Installation:

1. Download MySQL Installer from: https://dev.mysql.com/downloads/installer/
2. Run the installer and choose "Developer Default" setup
3. Set a root password during installation (can be empty for local dev)
4. MySQL will run on port 3306 by default

### Start MySQL Service (Windows):

```bash
# Start MySQL service
net start mysql

# Stop MySQL service
net stop mysql
```

## Option 2: Use XAMPP (Easier setup)

1. Download XAMPP from: https://www.apachefriends.org/
2. Install XAMPP
3. Open XAMPP Control Panel
4. Start "Apache" and "MySQL" services
5. MySQL will be available on localhost:3306

## Option 3: Use Docker (If you have Docker)

```bash
# Run MySQL in a Docker container
docker run --name mysql-dev -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=react_demo -p 3306:3306 -d mysql:8.0

# Connect to the container
docker exec -it mysql-dev mysql -uroot -ppassword
```

## Testing the Connection

After setting up MySQL, test the connection:

```bash
cd server
npm run dev
```

## Vercel MySQL Setup

For production on Vercel, you have several options:

### 1. PlanetScale (MySQL-compatible, free tier)

- Visit: https://planetscale.com/
- Create free account and database
- Get connection string and add to Vercel environment variables

### 2. Railway MySQL

- Visit: https://railway.app/
- Create MySQL database
- Add connection details to Vercel

### 3. Vercel Storage (Coming soon)

- Vercel is launching their own MySQL service

## Environment Variables for Vercel

Add these to your Vercel project settings:

- `MYSQL_HOST`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`
- `MYSQL_PORT` (usually 3306)

## Current Configuration

- **Local Dev**: Will try to connect to MySQL, fallback to in-memory
- **Production**: Will use Vercel environment variables or fallback to in-memory
- **Database Name**: `react_demo`
- **Table**: `users` (auto-created with sample data)
