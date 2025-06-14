# Authentication Backend

A robust Node.js authentication backend with JWT, Google OAuth, and real-time OTP verification.

## Features

- User registration with email verification via OTP
- JWT-based authentication
- Google OAuth integration
- Password reset with OTP verification
- User profile management
- Secure password handling with bcrypt
- TypeScript for type safety

## Tech Stack

- Node.js & Express.js
- TypeScript
- Sequelize ORM with MySQL
- Passport.js for authentication strategies
- JWT for token-based authentication
- Nodemailer for email delivery
- Speakeasy for OTP generation and verification

## Getting Started

### Prerequisites

- Node.js (v14+)
- MySQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy the example environment file:
   ```
   cp .env.example .env
   ```
4. Update the `.env` file with your configuration values
5. Create the database:
   ```sql
   CREATE DATABASE auth_db;
   ```
6. Build and run the server:
   ```
   npm run build
   npm start
   ```

For development mode:
```
npm run dev
```

## Environment Configuration

Update the `.env` file with your specific configuration:

```
# Server Configuration
PORT=8000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=auth_db
DB_USER=root
DB_PASSWORD=password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=86400 # 24 hours in seconds

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8000/api/auth/google/callback

# Email Configuration (for OTP delivery)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=your_email@gmail.com

# OTP Configuration
OTP_SECRET=your_otp_secret_key
OTP_EXPIRATION=300 # 5 minutes in seconds
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/resend-otp` - Resend OTP for verification
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with OTP

### User Management

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change user password

## License

This project is licensed under the MIT License. 