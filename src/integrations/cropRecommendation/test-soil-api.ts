/**
 * Test script for soil API integration with modelLoader
 * 
 * This script tests the updated modelLoader.ts to verify that it can fetch soil parameters
 * from the soil API and use them for crop recommendations.
 */

// Import the functions from modelLoader
const { getModelPredictions, fetchSoilData } = require('./modelLoader');

// Test pincode for a location in India
const testPincode = '110001'; // Delhi
const testDistrict = 'New Delhi';
const testState = 'Delhi';

// Test with only pincode (should fetch all soil parameters from API)
async function testWithPincodeOnly() {
  console.log('\n--- Testing with pincode only ---');
  try {
    // Only provide season and state, soil parameters should be fetched from API
    const predictions = await getModelPredictions(
      { 
        season: 'Kharif',
        state: testState,
        temperature: 0.6, // ~30°C
        humidity: 0.7, // ~70%
        rainfall: 0.4 // ~130mm
      },
      testPincode,
      testDistrict,
      testState
    );
    
    console.log('Predictions with soil data from API:', predictions);
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}

// Test with partial soil parameters (should fetch missing parameters from API)
async function testWithPartialParams() {
  console.log('\n--- Testing with partial soil parameters ---');
  try {
    // Provide some soil parameters, others should be fetched from API
    const predictions = await getModelPredictions(
      { 
        nitrogen: 0.5, // Provide nitrogen
        // phosphorus and potassium will be fetched from API
        ph: 0.6, // Provide pH
        season: 'Rabi',
        state: testState,
        temperature: 0.4, // ~24°C
        humidity: 0.6, // ~60%
        rainfall: 0.2 // ~75mm
      },
      testPincode,
      testDistrict,
      testState
    );
    
    console.log('Predictions with partial soil data:', predictions);
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}

// Test with all parameters provided (should not use API)
async function testWithAllParams() {
  console.log('\n--- Testing with all parameters provided ---');
  try {
    // Provide all parameters, API should not be called
    const predictions = await getModelPredictions(
      { 
        nitrogen: 0.7,
        phosphorus: 0.6,
        potassium: 0.5,
        ph: 0.7,
        season: 'Summer',
        state: testState,
        temperature: 0.8, // ~37°C
        humidity: 0.5, // ~50%
        rainfall: 0.3 // ~100mm
      }
    );
    
    console.log('Predictions with all parameters provided:', predictions);
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}

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

// Run all tests
async function runTests() {
  console.log('=== Starting Soil API Integration Tests ===');
  
  // Test direct soil data fetching
  const soilDataTest = await testFetchSoilData();
  console.log(`Direct soil data fetching: ${soilDataTest ? 'PASSED' : 'FAILED'}`);
  
  // Test with pincode only
  const pincodeTest = await testWithPincodeOnly();
  console.log(`Pincode-only test: ${pincodeTest ? 'PASSED' : 'FAILED'}`);
  
  // Test with partial parameters
  const partialTest = await testWithPartialParams();
  console.log(`Partial parameters test: ${partialTest ? 'PASSED' : 'FAILED'}`);
  
  // Test with all parameters
  const allParamsTest = await testWithAllParams();
  console.log(`All parameters test: ${allParamsTest ? 'PASSED' : 'FAILED'}`);
  
  console.log('\n=== Soil API Integration Tests Complete ===');
  console.log(`Overall result: ${soilDataTest && pincodeTest && partialTest && allParamsTest ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
}

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
});