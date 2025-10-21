# React Demo - Full-Stack User Management Application

A modern full-stack web application built with React, TypeScript, Node.js, and SQL Server. Features a professional user management interface with CRUD operations and real-time database integration.

## 🚀 Features

- **React Frontend**: Modern React 19 with TypeScript and Vite
- **Professional UI**: Navigation menu bar with responsive design
- **User Management**: Complete CRUD interface with data tables and statistics
- **Node.js Backend**: Express.js REST API with comprehensive error handling
- **Database Integration**: SQL Server LocalDB connectivity with Windows Authentication
- **Automated Setup**: Database initialization script for easy development setup
- **Fallback System**: Mock data fallback for development without database
- **Security**: Environment-based configuration with sensitive data protection

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **SQL Server LocalDB** (included with Visual Studio or SQL Server Express)
- **Windows** (for LocalDB and Windows Authentication)
- **ODBC Driver 17 for SQL Server** (usually pre-installed on Windows)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Serk4/React-Demo.git
cd React-Demo
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd server
npm install
```

### 4. Database Setup (LocalDB)

This application uses **SQL Server LocalDB** for easy development setup. LocalDB is a lightweight, on-demand version of SQL Server that's perfect for development.

#### Quick Setup (Recommended)

Run the automated setup script to create the database and sample data:

```bash
cd server
node setup-db.js
```

This script will:

- Connect to LocalDB instance `(localdb)\MSSQLLocalDB`
- Create the `React-Demo` database if it doesn't exist
- Create the `Users` table with proper schema
- Add sample user data for testing

#### Manual Setup (Alternative)

If you prefer manual setup or need to customize:

1. **Verify LocalDB is running:**

```bash
sqllocaldb info MSSQLLocalDB
```

2. **Create database manually:**

```bash
sqlcmd -S "(localdb)\MSSQLLocalDB" -E -Q "CREATE DATABASE [React-Demo]"
```

3. **Create Users table:**

```sql
USE [React-Demo];
GO

CREATE TABLE Users (
    Id INT PRIMARY KEY IDENTITY(1,1),
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL,
    IsActive BIT NOT NULL
);
GO

-- Add sample data
INSERT INTO Users (FirstName, LastName, Email, IsActive)
VALUES
('John', 'Doe', 'john@example.com', 1),
('Jane', 'Smith', 'jane@example.com', 1),
('Bob', 'Johnson', 'bob@example.com', 1),
('Alice', 'Brown', 'alice@example.com', 0),
('Charlie', 'Wilson', 'charlie@example.com', 1);
GO
```

### 5. Environment Configuration

Create the environment configuration file:

```bash
cd server
copy .env.example .env
```

Edit `.env` and set the database name:

```env
# LocalDB Configuration
DB_DATABASE=React-Demo

# Server Configuration
PORT=3001
```

**Note**: LocalDB connection details are automatically configured. The app uses:

- **Server**: `(localdb)\MSSQLLocalDB`
- **Authentication**: Windows Authentication (Trusted Connection)
- **Driver**: ODBC Driver 17 for SQL Server

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend API:**

```bash
cd server
node server.js
```

**Terminal 2 - React Frontend:**

```bash
npm run dev
```

The application will be available at:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

### Production Mode

```bash
# Build the React app
npm run build

# Serve the built app
npm run preview
```

## 📁 Project Structure

```
React-Demo/
├── src/                          # React frontend source
│   ├── components/               # Reusable React components
│   ├── pages/                   # Page components
│   │   ├── Home.tsx            # Home page with demo content
│   │   └── Users.tsx           # User management interface
│   ├── App.tsx                 # Main app component with routing
│   ├── App.css                 # Application styling
│   └── main.tsx                # React entry point
├── server/                      # Node.js backend
│   ├── routes/                 # API route handlers
│   │   └── users.js           # User CRUD operations
│   ├── database.js            # LocalDB connection & config
│   ├── server.js              # Express server setup
│   ├── setup-db.js            # Database initialization script
│   ├── .env.example           # Environment template (safe)
│   └── .env                   # Your actual config (not in git)
├── public/                     # Static assets
└── package.json               # Frontend dependencies
```

## 🔌 API Endpoints

### Users Management

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### System

- `GET /api/health` - Health check endpoint

### Example API Usage

```bash
# Get all users
curl http://localhost:3001/api/users

# Create a new user
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","isActive":true}'
```

## 🔧 Configuration Options

### Database Connection

The app uses **SQL Server LocalDB** with the following configuration:

- **Connection String**: `Server=(localdb)\\MSSQLLocalDB;Database=React-Demo;Trusted_Connection=yes;Driver={ODBC Driver 17 for SQL Server};`
- **Authentication**: Windows Authentication (passwordless)
- **Database**: React-Demo (auto-created by setup script)
- **Driver**: msnodesqlv8 with ODBC Driver 17

### Fallback Behavior

If database connection fails, the app automatically:

- Starts the server successfully
- Returns mock data for API calls
- Displays appropriate messages in the UI
- Logs connection attempts for debugging

## 🛡️ Security & Privacy

- **Environment Variables**: Sensitive data stored in `.env` (excluded from git)
- **Template File**: `.env.example` provides structure without exposing secrets
- **Windows Authentication**: Secure, passwordless database access
- **CORS**: Configured for cross-origin requests
- **Input Validation**: Server-side validation for all API inputs

## 🚀 Deployment

### Frontend (Vercel/Netlify)

```bash
npm run build
# Deploy the 'dist' folder
```

### Backend (Azure/AWS)

```bash
cd server
# Configure environment variables on your platform
# Deploy with Node.js runtime
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Database Connection Issues

**LocalDB not found:**

```bash
# Check if LocalDB is installed
sqllocaldb info

# Start LocalDB if needed
sqllocaldb start MSSQLLocalDB
```

**ODBC Driver issues:**

- Ensure "ODBC Driver 17 for SQL Server" is installed
- Download from Microsoft if missing
- Verify with: `odbcad32.exe` (check System DSN tab)

**Database setup fails:**

```bash
# Run the setup script with verbose output
cd server
node setup-db.js
```

**Connection timeout:**

- Check Windows Firewall settings
- Verify LocalDB is running: `sqllocaldb info MSSQLLocalDB`
- Try restarting LocalDB: `sqllocaldb stop MSSQLLocalDB && sqllocaldb start MSSQLLocalDB`

### Frontend Issues

- Clear browser cache
- Check console for JavaScript errors
- Verify API endpoints are accessible

### Backend Issues

- Check server logs for detailed error messages
- Verify all npm packages are installed
- Ensure ports 3001 and 5173 are available

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Review server logs for error messages
3. Verify your `.env` configuration matches `.env.example`
4. Create an issue in this repository with detailed information

---

**Built with ❤️ using React, Node.js, and SQL Server**
