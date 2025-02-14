#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting deployment process...${NC}"

# Check if git is initialized
if [ ! -d .git ]; then
    echo -e "${RED}Git repository not initialized. Initializing...${NC}"
    git init
fi

# Build the frontend
echo -e "${BLUE}Building frontend...${NC}"
cd frontend
npm run build
cd ..

# Check if build was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Frontend build successful!${NC}"
else
    echo -e "${RED}Frontend build failed! Aborting deployment.${NC}"
    exit 1
fi

# Stage all files
echo -e "${BLUE}Staging files...${NC}"
git add .

# Commit changes
echo -e "${BLUE}Committing changes...${NC}"
git commit -m "Deploy: $(date)"

# Push to main branch
echo -e "${BLUE}Pushing to main branch...${NC}"
git push origin main

echo -e "${GREEN}Deployment process completed!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Set up your repository on GitHub"
echo "2. Configure environment variables on your hosting platform"
echo "3. Connect your repository to your hosting platform"
echo "4. Deploy your application"
