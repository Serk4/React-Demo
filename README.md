# React Demo - Full-Stack User Management Application

A modern full-stack web application built with React, TypeScript, Node.js, and SQL Server. Features a professional user management interface with CRUD operations and real-time database integration.

## 🚀 Features

- **React Frontend**: Modern React 19 with TypeScript and Vite
- **Professional UI**: Navigation menu bar with responsive design
- **User Management**: Complete CRUD interface with data tables and statistics
- **Node.js Backend**: Express.js REST API with comprehensive error handling
- **Database Integration**: SQL Server connectivity with Windows Authentication
- **Fallback System**: Mock data fallback for development without database
- **Security**: Environment-based configuration with sensitive data protection

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **SQL Server** (Express, Developer, or full version)
- **Windows** (for SQL Server Windows Authentication)

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

### 4. Database Setup

#### Option A: SQL Server Instance (Recommended)

1. Create a database named `React-Demo` in your SQL Server instance
2. Run the following SQL to create the Users table:

```sql
USE [React-Demo];
GO

-- Create Users table
CREATE TABLE Users (
    Id INT PRIMARY KEY IDENTITY(1,1),
    FirstName NVARCHAR(50),
    LastName NVARCHAR(50),
    Email NVARCHAR(100),
    IsActive BIT
);
GO

-- Insert sample users
INSERT INTO Users (FirstName, LastName, Email, IsActive)
VALUES
('Alice', 'Johnson', 'alice.johnson@example.com', 1),
('Bob', 'Smith', 'bob.smith@example.com', 1),
('Carol', 'Lee', 'carol.lee@example.com', 0),
('David', 'Nguyen', 'david.nguyen@example.com', 1),
('Eve', 'Martinez', 'eve.martinez@example.com', 0);
GO
```

#### Option B: LocalDB (Alternative)

If using LocalDB, the app will automatically fall back to mock data if connection fails.

### 5. Environment Configuration

```bash
# In the server directory, copy the example env file
cd server
copy .env.example .env
```

Edit `.env` and update with your SQL Server details:

```env
# Replace YOUR_LAPTOP_NAME with your actual computer name
DB_SERVER=YOUR_LAPTOP_NAME\MSSQLSERVER01
DB_DATABASE=React-Demo
DB_INSTANCE=MSSQLSERVER01
DB_USER=
DB_PASSWORD=
DB_PORT=1433
DB_ENCRYPT=false
DB_TRUST_CERT=true

PORT=3001
```

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
│   ├── database.js            # Database connection & config
│   ├── server.js              # Express server setup
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

The app supports multiple connection methods:

- SQL Server named instances
- LocalDB instances
- Windows Authentication (recommended)
- SQL Server Authentication

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

- Ensure SQL Server is running
- Verify Windows Authentication is enabled
- Check firewall settings for SQL Server port
- Confirm database and table exist

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
