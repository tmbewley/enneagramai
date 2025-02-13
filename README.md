# Enneagram AI

An AI-powered personal development platform that integrates multiple psychological and consciousness theories.

## Overview

Enneagram AI is a sophisticated full-stack web application that combines the ancient wisdom of the Enneagram with modern artificial intelligence to provide personalized growth insights and recommendations.

## Features

- 🤖 Conversational AI interface
- 🔄 Integration of multiple consciousness theories
- 👤 Personalized user experience
- 📊 Progress tracking and health level monitoring
- 🤝 Relationship compatibility analysis
- 📱 Responsive design for all devices
- 🌙 Dark mode support

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js/Express
- **Database**: MongoDB
- **Authentication**: JWT
- **Payment Processing**: Stripe

## Project Structure

```
enneagram-ai/
├── frontend/           # React frontend application
├── backend/           # Node.js/Express backend
│   ├── config/       # Configuration files
│   ├── controllers/  # Route controllers
│   ├── middleware/   # Custom middleware
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   └── server.js     # Server entry point
├── .env              # Environment variables
├── .gitignore        # Git ignore rules
└── package.json      # Project dependencies and scripts
```

## Getting Started

1. Clone the repository:
\`\`\`bash
git clone [repository-url]
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
cd frontend && npm install
\`\`\`

3. Set up environment variables:
Create a .env file in the root directory with the following variables:
\`\`\`
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_PRICE_ID=your_stripe_price_id
\`\`\`

4. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

## API Documentation

### Authentication Endpoints

- POST /api/users/register - Register a new user
- POST /api/users/login - Login user
- GET /api/users/profile - Get user profile

### AI Interaction Endpoints

- POST /api/ai/chat - Send message to AI
- GET /api/ai/history - Get chat history

### Subscription Endpoints

- POST /api/subscription/create - Create subscription
- GET /api/subscription/status - Get subscription status
- POST /api/subscription/cancel - Cancel subscription

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
