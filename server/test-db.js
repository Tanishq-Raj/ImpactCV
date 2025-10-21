import db from './db.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test functions
async function testConnection() {
  try {
    const result = await db.query('SELECT NOW()');
    console.log('✅ Database connection successful!');
    console.log('Current timestamp from database:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function testCrudOperations() {
  try {
    // 1. Create a test user
    console.log('\n--- Testing CRUD Operations ---');
    console.log('1. Creating test user...');
    const createUserResult = await db.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
      ['test@example.com', 'hashed_password_123']
    );
    const userId = createUserResult.rows[0].id;
    console.log('✅ Created test user with ID:', userId);

    // 2. Create a test resume
    console.log('\n2. Creating test resume...');
    const resumeData = {
      title: 'Test Resume',
      theme: 'modern',
      content: JSON.stringify({
        name: 'Test User',
        title: 'Software Developer',
        sections: [
          {
            type: 'experience',
            items: [{ company: 'Test Company', position: 'Developer', years: '2020-Present' }]
          }
        ]
      })
    };

    const createResumeResult = await db.query(
      'INSERT INTO resumes (user_id, title, theme, data) VALUES ($1, $2, $3, $4) RETURNING id',
      [userId, resumeData.title, resumeData.theme, resumeData.content]
    );
    const resumeId = createResumeResult.rows[0].id;
    console.log('✅ Created test resume with ID:', resumeId);

    // 3. Read the resume
    console.log('\n3. Reading test resume...');
    const readResult = await db.query('SELECT * FROM resumes WHERE id = $1', [resumeId]);
    console.log('✅ Retrieved resume:', readResult.rows[0].title);

    // 4. Update the resume
    console.log('\n4. Updating test resume...');
    await db.query(
      'UPDATE resumes SET title = $1 WHERE id = $2',
      ['Updated Test Resume', resumeId]
    );
    const updatedResult = await db.query('SELECT title FROM resumes WHERE id = $1', [resumeId]);
    console.log('✅ Updated resume title to:', updatedResult.rows[0].title);

    // 5. Delete the test data
    console.log('\n5. Cleaning up test data...');
    await db.query('DELETE FROM resumes WHERE id = $1', [resumeId]);
    await db.query('DELETE FROM users WHERE id = $1', [userId]);
    console.log('✅ Deleted test data successfully');

    return true;
  } catch (error) {
    console.error('❌ CRUD test failed:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('=== PostgreSQL Connection Test ===');
  const connectionSuccess = await testConnection();
  
  if (connectionSuccess) {
    await testCrudOperations();
  }
  
  // Close the connection pool
  process.exit(0);
}

runTests();