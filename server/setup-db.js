require('dotenv').config()
const sql = require('mssql/msnodesqlv8')

const dbConfig = {
	connectionString: `Server=(localdb)\\MSSQLLocalDB;Database=${process.env.DB_DATABASE};Trusted_Connection=yes;Driver={ODBC Driver 17 for SQL Server};`,
}

async function setupDatabase() {
	try {
		console.log('Connecting to database...')
		await sql.connect(dbConfig)

		// Create Users table if it doesn't exist
		console.log('Creating Users table...')
		await sql.query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
            CREATE TABLE Users (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                FirstName NVARCHAR(100) NOT NULL,
                LastName NVARCHAR(100) NOT NULL,
                Email NVARCHAR(100) NOT NULL,
                IsActive BIT NOT NULL
            )
        `)

		// Check if table has data
		const result = await sql.query('SELECT COUNT(*) as count FROM Users')
		const userCount = result.recordset[0].count

		if (userCount === 0) {
			console.log('Adding test data...')
			await sql.query(`
                INSERT INTO Users (FirstName, LastName, Email, IsActive) VALUES 
                ('John', 'Doe', 'john@example.com', 1),
                ('Jane', 'Smith', 'jane@example.com', 1),
                ('Bob', 'Johnson', 'bob@example.com', 1),
                ('Alice', 'Brown', 'alice@example.com', 0),
                ('Charlie', 'Wilson', 'charlie@example.com', 1)
            `)
			console.log('✅ Test data added successfully')
		} else {
			console.log(`ℹ️ Users table already has ${userCount} records`)
		}

		// Verify data
		const users = await sql.query('SELECT * FROM Users')
		console.log('✅ Current users in database:', users.recordset)
	} catch (err) {
		console.error('❌ Database setup failed:', err)
	} finally {
		sql.close()
	}
}

setupDatabase()
