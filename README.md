# SLCCRAOP - Sri Lanka Cyber Crime Registry and Accountability Oversight Project

## Overview

SLCCRAOP is a web application for reporting and tracking cyber crime incidents in Sri Lanka. 
The system protects user privacy through identifier hashing, Row Level Security, and 
FAKE-marked data storage. No real victim or suspect data is ever stored.

## Development

### Prerequisites

- Node.js v26.7.0+
- npm v12.0.2+
- Supabase account

### Local Development

```powershell
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser
# Visit http://localhost:5173
```

### Build

```powershell
# Build for production
npm run build
```

### Environment Variables

Copy `.env.example` and fill in your Supabase credentials:

```powershell
cp .env.example .env
```

Edit `.env` with your Supabase project URL and anon key.

### Available Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build production bundle
- `npm run lint` - Run TypeScript linting
- `npm run test` - Run unit tests
```

### Deployment

This project is configured for Cloudflare Pages deployment.

## Security

- All data marked with `[VERIFY]` placeholder - lawyer verification required
- Identifier hashing with SHA-256 and separate salt storage
- Row Level Security (RLS) enforced on all private tables
- No real victim/suspect information stored in database
- Security checklist available in `security/security-checklist.md`

## License

MIT