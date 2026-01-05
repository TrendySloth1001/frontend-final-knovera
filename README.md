# Knovera Frontend - Google OAuth Integration

A modern, responsive Next.js frontend for the Knovera education platform with Google OAuth authentication.

## Features

- 🔐 **Google OAuth Authentication** - Secure sign-in with Google
- 🎯 **Role-Based Signup** - Separate flows for teachers and students
- 📱 **Mobile Responsive** - Works seamlessly on all devices
- 🎨 **Clean Black & White Theme** - Simple, professional design
- 🔑 **JWT Token Management** - View token details and payload
- ⚡ **Next.js 15** - Latest features with App Router

## Tech Stack

- Next.js 15.1.1
- React 19
- TypeScript 5
- Tailwind CSS 4
- Lucide Icons
- js-cookie
- jwt-decode

## Getting Started

### Prerequisites

- Node.js 18+
- Backend server running at `http://localhost:3001`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3001](http://localhost:3001)

## OAuth Flow

1. User clicks "Sign in with Google"
2. Redirects to Google OAuth consent screen
3. Google returns to `/api/auth/google/callback`
4. Backend finds/creates User record
5. If profile exists → Return full JWT + redirect to home
6. If no profile → Return temp JWT + redirect to role selection
7. User completes `/signup/teacher` or `/signup/student`
8. Backend creates profile + returns full JWT
9. User authenticated with full access

## Pages

- `/` - Home page with token information (authenticated)
- `/login` - Google sign-in page
- `/auth/callback` - OAuth callback handler
- `/signup/select-role` - Choose teacher or student role
- `/signup/teacher` - Complete teacher profile
- `/signup/student` - Complete student profile

## API Endpoints

The frontend integrates with these backend endpoints:

- `GET /api/auth/google` - Initiate OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/me` - Get profile (protected)
- `DELETE /api/auth/logout` - Logout (protected)
- `PATCH /api/auth/deactivate` - Deactivate account (protected)
- `POST /api/signup/teacher` - Complete teacher signup
- `POST /api/signup/student` - Complete student signup

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with AuthProvider
│   ├── page.tsx             # Home page
│   ├── login/               # Login page
│   ├── auth/callback/       # OAuth callback handler
│   └── signup/              # Signup pages
│       ├── select-role/     # Role selection
│       ├── teacher/         # Teacher signup form
│       └── student/         # Student signup form
├── components/              # Reusable components
│   ├── TopNav.tsx          # Navigation bar
│   ├── GoogleButton.tsx    # Google sign-in button
│   └── TokenDisplay.tsx    # Token information display
├── contexts/               # React contexts
│   └── AuthContext.tsx     # Auth state management
├── lib/                    # Utilities
│   ├── api.ts             # API client & endpoints
│   └── token.ts           # JWT utilities
└── types/                 # TypeScript types
    └── auth.ts            # Auth-related types
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|  
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001` |

## Building for Production

```bash
npm run build
npm start
```

## Development

### Adding New Features

1. Create new pages in `src/app/`
2. Add components in `src/components/`
3. Define types in `src/types/`
4. Add API functions in `src/lib/api.ts`

### Styling

This project uses Tailwind CSS with a black and white theme.


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
