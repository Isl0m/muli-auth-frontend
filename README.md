# Multi-Authentication System

A modern, secure authentication platform with multiple authentication methods including password-based authentication, MFA, passwordless login, and WebAuthn biometric support.

## Features

- **Password Authentication**: Traditional email/password login with optional MFA
- **Multi-Factor Authentication (MFA)**: TOTP-based authentication with backup codes
- **Passwordless Authentication**: Magic links and email code-based login
- **WebAuthn/Biometric**: Support for fingerprint, face recognition, and security keys
- **Session Management**: JWT-based token management with secure HTTP-only cookies
- **Security Logging**: Comprehensive event logging for all authentication attempts
- **Admin Dashboard**: Monitor authentication metrics and security events

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 with Tailwind CSS v4
- **Components**: shadcn/ui

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Next.js API Routes (can be adapted to NestJS)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT, bcrypt password hashing

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repo-url>
cd authentication-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/auth_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
```

4. **Set up the database**

First, create your PostgreSQL database:
```bash
createdb auth_db
```

Then run the migration script:
```bash
psql -U your_user -d auth_db -f scripts/init-db.sql
```

Or use the v0 SystemAction tool to execute:
```
SystemAction(
  systemAction: "executeScript",
  executeScript: "scripts/init-db.sql"
)
```

5. **Install Drizzle dependencies**
```bash
npm install drizzle-orm postgres
npm install -D drizzle-kit
```

6. **Start the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

## Project Structure

```
├── app/
│   ├── layout.tsx                 # Root layout with metadata
│   ├── page.tsx                   # Landing page
│   ├── api/
│   │   └── auth/
│   │       ├── login/route.ts      # Password login endpoint
│   │       ├── register/route.ts   # User registration endpoint
│   │       ├── logout/route.ts     # Logout endpoint
│   │       ├── mfa/setup/route.ts  # MFA setup endpoint
│   │       └── passwordless/request/route.ts  # Passwordless request endpoint
│   └── auth/
│       ├── password/page.tsx       # Password auth UI
│       ├── passwordless/page.tsx   # Passwordless auth UI
│       └── biometric/page.tsx      # WebAuthn biometric UI
├── lib/
│   ├── db/
│   │   ├── index.ts              # Database connection
│   │   └── schema.ts             # Drizzle ORM schema
│   ├── auth/
│   │   ├── jwt.ts                # JWT utilities
│   │   ├── middleware.ts         # Auth middleware
│   │   └── webauthn.ts           # WebAuthn utilities
│   └── security/
│       └── logging.ts            # Security event logging
├── components/
│   └── ui/                       # shadcn/ui components
├── public/                       # Static assets
├── scripts/
│   └── init-db.sql              # Database initialization script
└── README.md                     # This file
```

## Authentication Flow

### Password Authentication
1. User enters email and password
2. Backend verifies credentials against bcrypt hash
3. JWT token is generated and stored in HTTP-only cookie
4. Optional MFA verification required
5. User is authenticated and redirected to dashboard

### Passwordless Authentication
1. User enters email
2. Backend generates secure token and sends via email
3. User clicks magic link or enters code
4. Token is verified and user is authenticated
5. JWT session is created

### WebAuthn Biometric
1. User selects biometric method (fingerprint, face, security key)
2. Browser prompts user to authenticate with biometric/security key
3. Credential is registered or verified via WebAuthn API
4. JWT token is generated upon successful verification

## Security Features

- **Password Hashing**: bcryptjs with salt rounds of 12
- **JWT Tokens**: Signed with HS256 algorithm, 24-hour expiration
- **HTTP-Only Cookies**: Secure token storage not accessible via JavaScript
- **Rate Limiting**: Implement rate limiting on auth endpoints in production
- **Account Lockout**: Automatic lockout after 5 failed attempts in 15 minutes
- **Security Logging**: All authentication events are logged with IP and user agent
- **CORS Protection**: Configure CORS appropriately for production
- **Input Validation**: All inputs are validated on both client and server

## API Endpoints

### Authentication

**POST /api/auth/register**
Register a new user
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "enableMfa": false
}
```

**POST /api/auth/login**
Login with password
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**POST /api/auth/logout**
Logout and invalidate session
```
Authorization: Bearer <token>
```

**POST /api/auth/passwordless/request**
Request passwordless login
```json
{
  "email": "user@example.com",
  "method": "magic-link"
}
```

**POST /api/auth/mfa/setup**
Initialize MFA setup
```json
{
  "mfaType": "totp"
}
Authorization: Bearer <token>
```

## Database Schema

### Users Table
- `id`: UUID primary key
- `email`: Unique email address
- `password_hash`: Bcrypt hashed password
- `created_at`, `updated_at`: Timestamps
- `is_active`: Account status

### MFA Settings Table
- Stores MFA configuration per user
- Supports TOTP, email, SMS methods
- Includes backup codes

### Magic Links Table
- Temporary tokens for passwordless auth
- Auto-expires after 15 minutes
- Tracked as used/unused

### WebAuthn Credentials Table
- Stores WebAuthn public keys
- Tracks signature counter
- Device naming for user convenience

### Sessions Table
- Active JWT sessions
- Tracks IP address and user agent
- Expiration timestamps

### Security Logs Table
- Comprehensive audit trail
- Event types, status, failure reasons
- IP and device information
- JSONB metadata for extensibility

## Configuration

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/db

# JWT
JWT_SECRET=your-secret-key

# Environment
NODE_ENV=development|production
```

### Rate Limiting (Optional)
For production, implement rate limiting:
```typescript
// Example using upstash/ratelimit
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '15m'),
});
```

## Development

### Running Tests
```bash
npm run test
```

### Linting
```bash
npm run lint
```

### Building
```bash
npm run build
npm start
```

## Security Audit Checklist

- [ ] Change JWT_SECRET in production
- [ ] Enable HTTPS in production
- [ ] Configure rate limiting
- [ ] Set up email service for passwordless auth
- [ ] Enable CORS appropriately
- [ ] Set secure cookie flags
- [ ] Implement input sanitization
- [ ] Add CSRF protection
- [ ] Monitor security logs regularly
- [ ] Implement password reset flow
- [ ] Set up email verification

## Deployment

### Vercel Deployment
1. Push to GitHub repository
2. Connect to Vercel project
3. Add environment variables in Vercel dashboard
4. Deploy

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Troubleshooting

### Database Connection Error
- Verify DATABASE_URL is correct
- Ensure PostgreSQL is running
- Check user permissions

### JWT Token Issues
- Verify JWT_SECRET is set
- Check token expiration time
- Ensure cookies are enabled in browser

### WebAuthn Not Working
- Check browser compatibility (Chrome 67+, Firefox 60+, Safari 13+)
- Verify HTTPS in production (required for WebAuthn)
- Check device biometric settings

## Future Enhancements

- [ ] OAuth 2.0 integration (Google, GitHub)
- [ ] SMS-based MFA
- [ ] Hardware security key management
- [ ] Risk-based authentication
- [ ] Machine learning-based anomaly detection
- [ ] Blockchain-based identity verification
- [ ] GraphQL API
- [ ] Mobile app support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open a GitHub issue or contact support.

## Security Disclosure

If you discover a security vulnerability, please email security@example.com instead of using the issue tracker.

---

Built with ❤️ for secure authentication
