# Subscription Management API Documentation

## Setup Instructions

### Prerequisites
- Node.js
- MongoDB instance
- npm
- [Stripe CLI](https://docs.stripe.com/stripe-cli) (for local testing)

### Environment Variables
Create a `.env` file in the root directory with the following variables:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/subscription-db
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=sk_test_51QuAx6PtGh2Gf6zeHgkfoIDpYSaxea9L0Kc2fF9hzBBlqVJcIPugfJjvGGeVKwHneEGkDjyB7bUjLmhR8xvPNRW60048bA9zG4
STRIPE_WEBHOOK_SECRET=whsec_0d80c9188c84c624d4c439149b33e95f9d3cb70d5352abac650c0dd63ba46db7
FRONTEND_URL=http://localhost:3000
```

- You can generate JWT_SECRET using "openssl rand -hex 64"

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
  {
      ...
  },
  {
      ...
  }
]
```

### Subscription Endpoints

#### Get Current Subscription
Retrieves the current subscription for the authenticated user.

```
GET /subscriptions
Authorization: Bearer jwt_token
```

**Response (200 OK):**
```json
{
  "id": "subscription_id",
  "userId": "user_id",
  "planId": "plan_id",
  "status": "active",
  "stripeSubscriptionId": "sub_...",
  "currentPeriodEnd": "2024-03-19T00:00:00.000Z",
  "createdAt": "2024-02-19T00:00:00.000Z"
}
```

**Response (404 Not Found):** When no active subscription exists
```json
{
  "statusCode": 404,
  "message": "No active subscription found",
  "error": "Not Found"
}
```

#### Cancel Subscription
Cancels the current subscription for the authenticated user.

```
DELETE /subscriptions
Authorization: Bearer jwt_token
```

**Response (200 OK):**
```json
{
  "message": "Subscription cancelled successfully"
}
```

**Response (404 Not Found):** When no active subscription exists
```json
{
  "statusCode": 404,
  "message": "No active subscription found",
  "error": "Not Found"
}
```
