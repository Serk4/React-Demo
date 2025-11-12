# React Demo - Complete CI/CD Pipeline Application

A modern full-stack web application built with React, TypeScript, Node.js, and MySQL. Features a professional user management interface with CRUD operations, comprehensive testing, and automated CI/CD deployment to Vercel.

## 🚀 Features

- **React Frontend**: Modern React 19 with TypeScript and Vite
- **Professional UI**: Navigation menu with responsive design and user edit modals
- **User Management**: Complete CRUD interface with data tables and real-time updates
- **Node.js Backend**: Express.js REST API with MySQL database integration
- **MySQL Database**: Local development with MySQL, cloud-ready for production
- **Smart Fallback**: Graceful degradation from MySQL to in-memory storage
- **Automated Testing**: Comprehensive test suite with 28 API tests
- **CI/CD Pipeline**: GitHub Actions with automated testing and Vercel deployment
- **Dual Deployment**: Separate frontend and backend projects on Vercel
- **Environment Parity**: Local development closely matches production

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MySQL** (Local development - XAMPP recommended for Windows)
- **Git** (For version control and CI/CD)
- **Vercel CLI** (Optional - for manual deployment)

## 🗄️ Database Options

### Local Development

- **XAMPP MySQL**: Easy Windows setup (recommended)
- **MySQL Server**: Direct installation
- **Docker MySQL**: Containerized setup
- **Fallback Mode**: In-memory storage if MySQL unavailable

### Production

- **PlanetScale**: Free tier, MySQL-compatible, serverless-optimized
- **Railway**: Simple setup with persistent storage
- **Vercel Storage**: Native Vercel integration (when available)
- **AWS RDS**: Enterprise-grade MySQL hosting

## 🧪 Testing & CI/CD

### Comprehensive Testing Suite

This project includes **28 automated tests** covering:

- **API Tests**: Complete CRUD operations (users.test.js - 21 tests)
- **Integration Tests**: Full workflow validation (integration.test.js - 4 tests)
- **Health Checks**: System connectivity (basic.test.js - 3 tests)
- **Mock Mode**: Tests work with or without database (perfect for CI/CD)

### Running Tests Locally

```bash
# Run all tests
cd server
npm test

# Run specific test files
npm test users.test.js
npm test integration.test.js
npm test basic.test.js

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### CI/CD Pipeline with Vercel Deployment

The project uses **GitHub Actions** for automated testing and **dual Vercel deployment**:

#### 🔄 **Automated Triggers**

- **Every push** to `main` branch → Full pipeline + production deployment
- **Every push** to `feature/*` branches → Tests and validation
- **Pull requests** to `main` → Complete validation before merge

#### 🏗️ **Multi-Job Pipeline**

**1. Test Job (Windows + Node.js 20.x)**

```yaml
✅ Checkout code from repository
✅ Setup Node.js 20.x with dependency caching
✅ Install frontend & backend dependencies
✅ Run 28 comprehensive API tests (MySQL fallback mode)
✅ Build React frontend for production
✅ Verify build artifacts and exit codes
```

**2. Lint Job (Ubuntu)**

```yaml
✅ ESLint code quality validation
✅ TypeScript type checking
✅ Formatting and style verification
```

**3. Security Job (Ubuntu)**

```yaml
✅ npm audit vulnerability scanning
✅ Frontend & backend dependency checks
✅ Security warnings (non-blocking)
```

**4. Deploy Job (Ubuntu)**

```yaml
✅ Runs only on successful main branch pushes
✅ Deploys Frontend to Vercel (React SPA)
✅ Deploys Backend to Vercel (Node.js serverless)
✅ Updates production URLs automatically
✅ Environment-specific configuration
```

#### 📊 **Deployment Architecture**

- **Frontend**: `react-demo` Vercel project (Static site)
- **Backend**: `server` Vercel project (Serverless functions)
- **Database**: MySQL (local) → In-memory (production) → Cloud MySQL (upgradeable)
- **Environment**: Development/production configuration via environment variables

#### 🔍 **Pipeline Status**

Check the **Actions** tab in GitHub to see:

- ✅ Green checkmarks = All tests passing, deployment successful
- ❌ Red X = Failed tests/deployment (blocks production)
- 🟡 Yellow dot = Pipeline running

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Serk4/React-Demo.git
cd react-demo
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 3. Database Setup (MySQL)

#### Option A: XAMPP (Recommended for Windows)

1. **Download XAMPP** from https://www.apachefriends.org/
2. **Install XAMPP** and start the MySQL service
3. **MySQL runs on** `localhost:3306` with user `root` (no password)

#### Option B: MySQL Server Direct Install

1. **Download MySQL Server** from https://dev.mysql.com/downloads/
2. **Install and configure** MySQL server
3. **Note your credentials** for environment configuration

#### Option C: Docker MySQL

```bash
docker run --name mysql-dev -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=react_demo -p 3306:3306 -d mysql:8.0
```

#### Verify MySQL Setup

```bash
cd server
node verify-mysql.js
```

This script will:

- ✅ Test MySQL connection
- ✅ Create `react_demo` database if needed
- ✅ Set up `users` table with sample data
- ✅ Display current data status

### 4. Environment Configuration

The backend is pre-configured for standard MySQL setups:

```env
# MySQL Configuration (server/.env)
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=           # Empty for XAMPP default
MYSQL_DATABASE=react_demo
MYSQL_PORT=3306
```

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend API:**

```bash
cd server
npm run dev
```

**Terminal 2 - React Frontend:**

```bash
npm run dev
```

The application will be available at:

- **Frontend**: http://localhost:5173 (or http://localhost:5174 if 5173 is busy)
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health
- **Database Status**: Check console logs for MySQL connection status

### Production Mode

```bash
# Build the React app
npm run build

# Preview the built app
npm run preview
```

## 🌐 Live Deployment

### Production URLs

- **Frontend**: https://react-demo-[deployment-id].vercel.app
- **Backend API**: https://server-[deployment-id].vercel.app
- **Users Page**: https://react-demo-[deployment-id].vercel.app/users

### Database in Production

- **Current**: In-memory storage (resets periodically)
- **Upgrade Options**: PlanetScale, Railway, or other cloud MySQL
- **Smart Fallback**: Always works even without persistent storage

## 📁 Project Structure

```
react-demo/
├── src/                          # React frontend source
│   ├── components/               # Reusable React components
│   │   ├── Modal.tsx            # Base modal component
│   │   ├── UserCreateModal.tsx  # User creation modal
│   │   └── UserEditModal.tsx    # User editing modal with validation
│   ├── config/                  # Configuration
│   │   └── api.ts               # API endpoint configuration
│   ├── pages/                   # Page components
│   │   ├── Home.tsx            # Landing page
│   │   └── Users.tsx           # User management interface
│   ├── App.tsx                 # Main app with routing
│   └── main.tsx                # React entry point
├── server/                      # Node.js backend
│   ├── routes/                 # API route handlers
│   │   └── users.js           # User CRUD operations
│   ├── tests/                 # Automated test suite
│   │   ├── users.test.js      # User API tests (21 tests)
│   │   ├── integration.test.js # CRUD workflow tests (4 tests)
│   │   ├── basic.test.js      # Health check tests (3 tests)
│   │   ├── setup.js           # Jest configuration
│   │   ├── testDatabase.js    # Database test utilities
│   │   └── README.md          # Testing documentation
│   ├── database-mysql.js      # MySQL connection & fallback
│   ├── server.js              # Express server setup
│   ├── verify-mysql.js        # MySQL verification script
│   ├── jest.config.js         # Jest test configuration
│   ├── vercel.json            # Vercel deployment config
│   ├── .env                   # Environment variables
│   ├── MYSQL-SETUP.md         # Local MySQL setup guide
│   ├── PLANETSCALE-SETUP.md   # Cloud MySQL setup guide
│   └── MIGRATION-CLEANUP.md   # SQL Server → MySQL migration notes
├── .github/                    # GitHub Actions CI/CD
│   └── workflows/
│       └── ci-cd.yml          # Complete pipeline configuration
├── public/                     # Static assets
├── vercel.json                # Frontend Vercel configuration
└── package.json               # Frontend dependencies
```

## 🔌 API Endpoints

### Users Management

- `GET /api/users` - Get all users with real-time data
- `GET /api/users/:id` - Get specific user by ID
- `POST /api/users` - Create new user with validation
- `PUT /api/users/:id` - Update user with field validation
- `DELETE /api/users/:id` - Delete user with confirmation

### System

- `GET /api/health` - Health check with database status

### Example API Usage

```bash
# Get all users
curl https://server-[deployment-id].vercel.app/api/users

# Create a new user
curl -X POST https://server-[deployment-id].vercel.app/api/users \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","isActive":true}'
```

## 🔧 Configuration Options

### Database Configuration

**Local Development (MySQL):**

```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=react_demo
MYSQL_PORT=3306
```

**Production (Cloud MySQL):**

```env
MYSQL_HOST=your-database-host.psdb.cloud
MYSQL_USER=your-username
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=react_demo
MYSQL_PORT=3306
```

### Intelligent Fallback System

The application uses smart database connectivity:

1. **Primary**: Attempts MySQL connection
2. **Fallback**: In-memory storage if MySQL unavailable
3. **Logging**: Clear status messages in console
4. **Graceful**: Application always starts successfully

## 🛡️ Security & Best Practices

- **Environment Variables**: Database credentials in `.env` (excluded from git)
- **API Validation**: Server-side input validation and sanitization
- **CORS Configuration**: Secure cross-origin request handling
- **Error Handling**: Graceful error responses without sensitive data exposure
- **Type Safety**: Full TypeScript implementation with strict typing
- **Test Coverage**: Comprehensive testing prevents regression bugs

## 🚀 Deployment Options

### Automatic Deployment (Recommended)

1. **Push to GitHub** → Automatic deployment via GitHub Actions
2. **Pull Request** → Automatic staging environment
3. **Merge to main** → Production deployment

### Manual Deployment

```bash
# Deploy frontend
vercel --prod

# Deploy backend
cd server
vercel --prod
```

### Environment Setup for Production

1. **Vercel Dashboard** → Your projects → Settings → Environment Variables
2. **Add MySQL variables** for persistent storage
3. **Redeploy** for changes to take effect

## 🆙 Upgrade Path

### From In-Memory to Persistent Storage

1. **Sign up for PlanetScale** (free tier - 5GB)
2. **Create database** named `react_demo`
3. **Add connection variables** to Vercel
4. **Redeploy** → Automatic persistent storage!

### From Single to Multi-Environment

1. **Create staging environment** in Vercel
2. **Add staging database** connection
3. **Configure branch deployments** for feature testing

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes with tests
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open Pull Request → Automatic testing + staging deployment

## 🆘 Troubleshooting

### Database Connection Issues

**MySQL not connecting:**

```bash
# Verify MySQL is running
cd server
node verify-mysql.js

# Start XAMPP MySQL service
# OR restart MySQL service
```

**Local development fallback:**

- App automatically uses in-memory storage if MySQL unavailable
- Check console for "Database status: FALLBACK (In-memory)"

### Deployment Issues

**GitHub Actions failing:**

- Check Actions tab for detailed error logs
- Verify all tests pass locally: `cd server && npm test`
- Ensure frontend builds: `npm run build`

**Vercel deployment errors:**

- Check Vercel dashboard for build logs
- Verify environment variables are set
- Check function timeout limits

### API Issues

**CORS errors:**

- Verify frontend API configuration in `src/config/api.ts`
- Check that backend URL matches current deployment

**Data not persisting:**

- Expected behavior with in-memory storage
- Upgrade to cloud MySQL for persistence

## 📞 Support

For issues or questions:

1. **Check logs**: Console output shows detailed status
2. **Run verification**: `node server/verify-mysql.js`
3. **Test locally**: `cd server && npm test`
4. **Create GitHub issue** with detailed information

---

**🚀 Built with React 19, Node.js, MySQL, and deployed on Vercel**

_Complete CI/CD pipeline from code to production in minutes!_
// Environment variables updated 11/12/2025 16:09:20
