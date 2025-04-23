# Node.js API

A simple Node.js server with Express that provides various API endpoints for testing.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will start on http://localhost:3000

## API Endpoints

- GET `/` - Returns a welcome message
- GET `/api/test` - Test GET endpoint
- POST `/api/test` - Test POST endpoint (send JSON with `message` field)
- GET `/health` - Health check endpoint

## Deployment on Railway

1. Create a new project on [Railway](https://railway.app)
2. Connect your GitHub repository
3. Railway will automatically detect the Node.js project and deploy it
4. The app will be available at the provided Railway URL

## Environment Variables

- `PORT` - Server port (default: 3000)

## Development

- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier