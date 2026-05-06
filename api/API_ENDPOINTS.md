# Rogers Park Community Platform - API Endpoints

## Authentication Endpoints

### Email Verification

#### Send Verification Email
```http
POST /api/v1/auth/send-verification-email
```
- **Auth Required**: Yes (session cookie)
- **Description**: Sends a verification email to the authenticated user
- **Response**: Success message
- **Token Expiry**: 24 hours

#### Verify Email
```http
POST /api/v1/auth/verify-email
```
- **Auth Required**: No
- **Body**: `{ "token": "verification_token" }`
- **Description**: Verifies user's email address with the provided token
- **Response**: Success or error message

### Password Reset

#### Request Password Reset
```http
POST /api/v1/auth/request-password-reset
```
- **Auth Required**: No
- **Body**: `{ "email": "user@example.com" }`
- **Description**: Sends password reset email (always returns success for security)
- **Token Expiry**: 1 hour
- **Security**: Generic response regardless of email existence

#### Reset Password
```http
POST /api/v1/auth/reset-password
```
- **Auth Required**: No
- **Body**: `{ "token": "reset_token", "newPassword": "newpass123" }`
- **Description**: Resets password using valid token
- **Validation**: Min 8 characters
- **Response**: Success or error message

#### Validate Reset Token
```http
GET /api/v1/auth/validate-reset-token/:token
```
- **Auth Required**: No
- **Description**: Checks if password reset token is valid
- **Response**: `{ "valid": true/false }`

## Testing

- **Total Tests**: 100 passing
- **Test Files**: 13
- **Coverage**: Email verification, password reset, authentication, sessions

## Security Features

- Tokens hashed with SHA-256 before storage
- One-time use tokens (deleted after use)
- Automatic cleanup of old tokens
- Generic error messages (prevent user enumeration)
- Expiration validation
- Password strength requirements

## Development

Email service currently uses console logging. Replace with production service (Resend, SendGrid, AWS SES) before deploying.

Frontend URLs (configurable):
- Verification: `http://localhost:5173/verify-email?token=xxx`
- Password Reset: `http://localhost:5173/reset-password?token=xxx`
