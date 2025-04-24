#!/bin/bash

# Build the React app
echo "Building the React app..."
npm run build

# Deploy Firebase functions
echo "Deploying Firebase functions..."
cd functions && npm run deploy

# Deploy Firebase hosting (PWA)
echo "Deploying Firebase hosting..."
cd .. && firebase deploy --only hosting

echo "Deployment complete!" 