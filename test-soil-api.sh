#!/bin/bash

# Run the soil API integration test
echo "Running soil API integration test..."
npx ts-node src/integrations/cropRecommendation/test-soil-api.ts