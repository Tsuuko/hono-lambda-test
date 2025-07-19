import { hc } from 'hono/client';
import type { AppType } from './app';

// Create type-safe RPC client
const client = hc<AppType>('http://localhost:3000');

// Get all users
async function getUsers() {
  console.log('=== GET /users (RPC) ===');
  try {
    const response = await client.users.$get();
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Create a new user
async function createUser(id: string) {
  console.log(`=== POST /users (RPC) ===`);
  try {
    const response = await client.users.$post({
      json: { id },
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Get specific user by ID
async function getUser(id: string) {
  console.log(`=== GET /users/${id} (RPC) ===`);
  try {
    const response = await client.users[':id'].$get({
      param: { id },
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Update user by ID
async function updateUser(id: string) {
  console.log(`=== PUT /users/${id} (RPC) ===`);
  try {
    const response = await client.users[':id'].$put({
      param: { id },
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Delete user by ID
async function deleteUser(id: string) {
  console.log(`=== DELETE /users/${id} (RPC) ===`);
  try {
    const response = await client.users[':id'].$delete({
      param: { id },
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Demo function to test all APIs
async function testAllApis() {
  console.log('🚀 Starting RPC API tests...\n');

  // 1. Get all users
  await getUsers();
  console.log('\n');

  // 2. Create a new user
  await createUser('123');
  console.log('\n');

  // 3. Get the created user
  await getUser('123');
  console.log('\n');

  // 4. Update the user
  await updateUser('123');
  console.log('\n');

  // 5. Delete the user
  await deleteUser('123');
  console.log('\n');

  // 6. Try to get deleted user (should still work as it's mock data)
  await getUser('123');
  console.log('\n');

  console.log('✅ RPC API tests completed!');
}

// Run the tests if this file is executed directly
if (require.main === module) {
  testAllApis().catch(console.error);
}

// Export functions for use in other files
export { getUsers, createUser, getUser, updateUser, deleteUser, testAllApis };
