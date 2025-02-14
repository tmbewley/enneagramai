# EnneagramAI

AI-powered personal development platform integrating psychological and consciousness theories.

## Features

- User Authentication
- AI Chat Interface with xAI Grok Integration
- Real-time Typing Indicators
- Assessment System
- Personal Development Tracking
- Conversation History
- Secure JWT Authentication

## Tech Stack

- **Frontend**: React, TypeScript, Chakra UI
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Real-time**: Socket.IO
- **AI**: xAI Grok API

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- xAI API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/enneagramai.git
cd enneagramai
```

2. Install dependencies:
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
npm run install-client
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your environment variables:
     - `MONGO_URI`: Your MongoDB connection string
     - `JWT_SECRET`: A secure random string for JWT signing
     - `XAI_API_KEY`: Your xAI API key
     - `XAI_API_URL`: The xAI API endpoint
     - `FRONTEND_URL`: Your frontend URL (in development: http://localhost:3000)

## Development

Run the development server:

```bash
# Run both frontend and backend
npm run dev

# Run backend only
npm run server

# Run frontend only
npm run client
```

The development server will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Production Deployment

### Preparing for Production

1. Update environment variables:
   - Create new MongoDB Atlas cluster for production
   - Generate new JWT secret
   - Update API keys
   - Set NODE_ENV to 'production'

2. Build the frontend:
```bash
npm run build
```

### Deployment Options

#### Option 1: Render.com (Recommended)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure environment variables in Render dashboard
4. Set build command: `npm install && npm run install-client && npm run build`
5. Set start command: `npm start`

#### Option 2: Railway.app

1. Create new project on Railway
2. Connect your GitHub repository
3. Add environment variables
4. Railway will automatically detect and deploy your application

#### Option 3: Vercel (Frontend) + Railway/Render (Backend)

1. Deploy frontend to Vercel:
   - Connect GitHub repository
   - Set build command: `cd frontend && npm install && npm run build`
   - Configure environment variables

2. Deploy backend separately using Railway or Render instructions above

## Environment Variables

```env
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
XAI_API_URL=your_xai_api_url
XAI_API_KEY=your_xai_api_key
FRONTEND_URL=your_frontend_url
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
