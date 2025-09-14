/**
 * Test script for soil API integration with modelLoader
 */

// Import the supabase client
import { createClient } from '@supabase/supabase-js';

// Create a simple mock of the modelLoader functionality
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://your-project-url.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'your-anon-key'
);

// Mock fetchSoilData function
async function fetchSoilData(pincode, district, state) {
  try {
    console.log(`Fetching soil data for pincode: ${pincode}, district: ${district}, state: ${state}`);
    const { data, error } = await supabase.functions.invoke('get-soil-data', {
      body: { 
        pincode,
        district: district || 'Unknown',
        state: state || 'Unknown'
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    console.log('Soil data fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error fetching soil data:', error);
    throw new Error('Failed to fetch soil data from API');
  }
}

// Test pincode for a location in India
const testPincode = '110001'; // Delhi
const testDistrict = 'New Delhi';
const testState = 'Delhi';

// Test direct soil data fetching
async function testFetchSoilData() {
  console.log('\n--- Testing direct soil data fetching ---');
  try {
    const soilData = await fetchSoilData(testPincode, testDistrict, testState);
    console.log('Soil data from API:', soilData);
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}

// Run the test
async function runTest() {
  console.log('=== Starting Soil API Integration Test ===');
  
  // Test direct soil data fetching
  const soilDataTest = await testFetchSoilData();
  console.log(`Direct soil data fetching: ${soilDataTest ? 'PASSED' : 'FAILED'}`);
  
  console.log('\n=== Soil API Integration Test Complete ===');
}

// Run the test
runTest().catch(error => {
  console.error('Error running test:', error);
});