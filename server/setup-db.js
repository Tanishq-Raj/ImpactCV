import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create PostgreSQL connection
const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function setupDatabase() {
  try {
    console.log('Setting up database tables...');
    
    // Read schema SQL
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Split SQL into separate statements
    const statements = schemaSql
      .split(';')
      .filter(statement => statement.trim() !== '')
      .map(statement => statement + ';');
    
    // Execute each statement
    for (const statement of statements) {
      await pool.query(statement);
      console.log('Executed:', statement.substring(0, 50) + '...');
    }
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    // Close the connection pool
    await pool.end();
  }
}

// Run the setup
setupDatabase();