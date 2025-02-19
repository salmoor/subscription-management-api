# Subscription Management API Documentation

## Setup Instructions

### Prerequisites
- Node.js
- MongoDB instance
- npm

### Environment Variables
Create a `.env` file in the root directory with the following variables:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/subscription-db
JWT_SECRET=your_jwt_secret_key
```

### Installation Steps
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run start:dev
   ```

The server will start on `http://localhost:3000` (or the PORT specified in your .env)

## API Documentation

### Authentication Endpoints

#### Sign Up
Creates a new user account.

```
POST /auth/signup
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com"
  },
  "token": "jwt_token"
}
```

**Possible Errors:**
- `409 Conflict`: Email already exists
- `400 Bad Request`: Invalid email or password format

#### Login
Authenticates an existing user.

```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com"
  },
  "token": "jwt_token"
}
```

**Possible Errors:**
- `401 Unauthorized`: Invalid credentials

### Using Authentication

For protected endpoints, include the JWT token in the Authorization header:

```
Authorization: Bearer your_jwt_token
```

### Subscription Plans

#### Get All Plans
Retrieves all available subscription plans.

```
GET /plans
```

**Response (200 OK):**
```json
[
  {
    "id": "basic",
    "name": "Basic Plan",
    "description": "Perfect for individuals and small projects",
    "price": 9.99,
    "features": [
      "Basic features",
      "Email support",
      "Limited access"
    ],
    "stripePriceId": "price_basic_monthly"
  },
  // ... other plans
]
```

### Subscription Endpoints

#### Create Subscription
Creates a new subscription for the authenticated user.

\`\`\`
POST /subscriptions
Authorization: Bearer jwt_token
\`\`\`

**Request Body:**
\`\`\`json
{
  "planId": "basic"
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "sessionId": "sessionId"
}
\`\`\`

#### Get Current Subscription
Retrieves the current subscription for the authenticated user.

\`\`\`
GET /subscriptions
Authorization: Bearer jwt_token
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "id": "subscription_id",
  "userId": "user_id",
  "planId": "basic",
  "status": "active",
  "stripeSubscriptionId": "sub_..."
}
\`\`\`

#### Cancel Subscription
Cancels the current subscription for the authenticated user.

\`\`\`
DELETE /subscriptions
Authorization: Bearer jwt_token
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "message": "Subscription cancelled successfully"
}
\`\`\`

### Stripe Webhook
Endpoint for handling Stripe webhook events.

\`\`\`
POST /subscriptions/webhook
\`\`\`
