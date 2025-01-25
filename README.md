# Blood Donation Web Application

A modern fullstack web application for blood donation management. Users can register as donors and search for donors based on blood groups.

## Features

- User-friendly donor registration form
- Blood group filtering
- Modern and responsive UI using Material-UI
- MongoDB database integration
- Form validation for email and phone number
- Donor listing with contact information

## Setup Instructions

1. Install dependencies for backend:
```bash
npm install
```

2. Install dependencies for frontend:
```bash
cd client
npm install
```

3. Create a .env file in the root directory with:
```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

4. Start the backend server:
```bash
npm run dev
```

5. Start the frontend development server:
```bash
cd client
npm start
```

The application will be available at http://localhost:3000

## Technology Stack

- Frontend: React, Material-UI
- Backend: Node.js, Express
- Database: MongoDB
- Additional libraries: axios, react-router-dom, date-fns
