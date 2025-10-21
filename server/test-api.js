// API Test Script
// Run this while the server is running to test the API endpoints
import db from './db.js';

async function testApiEndpoints() {
  const API_URL = 'http://localhost:5000/api';
  let userId, resumeId;

  console.log('=== Testing API Endpoints ===');

  try {
    // 1. Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_URL}/health`);
    const healthData = await healthResponse.json();
    console.log(`✅ Health check: ${JSON.stringify(healthData)}`);

    // 2. Create or get a test user in the database
    console.log('\n2. Creating or getting test user in database...');
    // Check if test user already exists
    const userCheck = await db.query(
      'SELECT id FROM users WHERE email = $1',
      ['apitest@example.com']
    );
    
    if (userCheck.rows.length > 0) {
      userId = userCheck.rows[0].id;
      console.log(`✅ Using existing test user with ID: ${userId}`);
    } else {
      const createUserResult = await db.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
        ['apitest@example.com', 'test123']
      );
      userId = createUserResult.rows[0].id;
      console.log(`✅ Created new test user with ID: ${userId}`);
    }
    
    // 3. Create a resume
    console.log('\n3. Creating a new resume...');
    const newResume = {
      user_id: userId,
      title: 'API Test Resume',
      content: {
        personalInfo: {
          name: 'API Test User',
          email: 'apitest@example.com',
          phone: '123-456-7890',
          title: 'Software Developer'
        },
        sections: [
          {
            type: 'experience',
            items: [
              {
                company: 'API Test Company',
                position: 'Developer',
                startDate: '2020',
                endDate: 'Present',
                description: 'Testing the API endpoints'
              }
            ]
          }
        ]
      }
    };

    const createResponse = await fetch(`${API_URL}/resumes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newResume)
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create resume: ${createResponse.status}`);
    }

    const createdResume = await createResponse.json();
    resumeId = createdResume.id;
    console.log(`✅ Created resume with ID: ${resumeId}`);

    // 4. Get all resumes for user
    console.log('\n4. Getting all resumes for user...');
    const getResponse = await fetch(`${API_URL}/resumes/${userId}`);
    
    if (!getResponse.ok) {
      throw new Error(`Failed to get resumes: ${getResponse.status}`);
    }
    
    const resumes = await getResponse.json();
    console.log(`✅ Retrieved ${resumes.length} resume(s) for user`);

    // 5. Get specific resume
    console.log('\n5. Getting specific resume...');
    const getDetailResponse = await fetch(`${API_URL}/resume/${resumeId}`);
    
    if (!getDetailResponse.ok) {
      throw new Error(`Failed to get resume details: ${getDetailResponse.status}`);
    }
    
    const resumeDetail = await getDetailResponse.json();
    console.log(`✅ Retrieved resume: ${resumeDetail.title}`);

    // 6. Update resume
    console.log('\n6. Updating resume...');
    const updateData = {
      title: 'Updated API Test Resume',
      content: {
        personalInfo: {
          name: 'Updated API Test User',
          email: 'apitest@example.com',
          phone: '123-456-7890',
          title: 'Senior Developer'
        },
        sections: [
          {
            type: 'experience',
            items: [
              {
                company: 'Updated API Test Company',
                position: 'Senior Developer',
                startDate: '2021',
                endDate: 'Present',
                description: 'Successfully tested the API endpoints'
              }
            ]
          }
        ]
      }
    };

    const updateResponse = await fetch(`${API_URL}/resume/${resumeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (!updateResponse.ok) {
      throw new Error(`Failed to update resume: ${updateResponse.status}`);
    }

    const updatedResume = await updateResponse.json();
    console.log(`✅ Updated resume title to: ${updatedResume.title}`);

    // 7. Delete resume
    console.log('\n7. Deleting resume...');
    const deleteResponse = await fetch(`${API_URL}/resume/${resumeId}`, {
      method: 'DELETE'
    });

    if (!deleteResponse.ok) {
      throw new Error(`Failed to delete resume: ${deleteResponse.status}`);
    }

    const deleteResult = await deleteResponse.json();
    console.log(`✅ ${deleteResult.message}`);

    // 8. Clean up - delete test user
    console.log('\n8. Cleaning up - deleting test user...');
    await db.query('DELETE FROM users WHERE id = $1', [userId]);
    console.log('✅ Test user deleted');

    console.log('\n✅ All API tests completed successfully!');
  } catch (error) {
    console.error(`❌ API test failed: ${error.message}`);
  }
}

// Run the tests
testApiEndpoints();