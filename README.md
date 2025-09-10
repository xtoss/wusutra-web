# Wusutra Web App

A web application for dialect preservation that helps users learn and practice local Chinese dialects through interactive exercises and speech recognition.

## Features

- **Recording Interface**: Record yourself speaking dialect phrases
- **Audio Library**: Browse and listen to dialect phrases with translations
- **Training Dashboard**: View model training status and progress
- **Leaderboard**: Track learning progress across users
- **Support System**: Get help and submit feedback

## Tech Stack

- **Framework**: Next.js 13+ with App Router
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Audio**: Web Audio API
- **Storage**: AWS S3 integration

## Important: Backend Configuration Required

**This web app requires backend services to function.** No API endpoints are included in the source code.

### Required Configuration:

The app uses a local configuration system for development:

1. **Create local config file**: `lib/config-local.ts` (git-ignored)
   ```typescript
   export const localConfig = {
     api: {
       baseUrl: 'YOUR_API_ENDPOINT',
       trainingUrl: 'YOUR_TRAINING_ENDPOINT'
     }
   } as const
   ```

2. **Or use environment variables**:
   ```bash
   NEXT_PUBLIC_API_BASE_URL=your_api_endpoint
   NEXT_PUBLIC_TRAINING_API_URL=your_training_endpoint
   ```

### Backend Requirements:

To use this app, you need to deploy:
- Audio upload service (AWS Lambda or similar)
- ML training pipeline (SageMaker or similar)
- Inference endpoint for transcription
- Database for storing recordings

## Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wusutra-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoints** (choose one):
   - Create `lib/config-local.ts` with your endpoints
   - Or set environment variables in `.env.local`

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

### Static Export (Recommended)

This app can be deployed as a static site:

```bash
npm run build
```

The exported files will be in the `/out` directory.

### Platform Deployment

Compatible with:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

## Configuration Details

The app uses a smart configuration system:

1. **Environment variables** (highest priority)
2. **Local config file** (`lib/config-local.ts`)
3. **Empty defaults** (requires manual configuration)

This ensures:
- Local development uses your endpoints automatically
- Public repository doesn't expose sensitive URLs
- Other developers must configure their own backend

## Security Notes

- No hardcoded API keys or secrets
- Local configuration files are git-ignored
- All API calls are client-side (uses NEXT_PUBLIC_ prefix)
- Audio recordings are processed server-side

## Contributing

1. Ensure all sensitive information is in `lib/config-local.ts` (git-ignored)
2. Follow existing code style and patterns
3. Test with your own backend services
4. Never commit API endpoints or sensitive data

## License

[Your License Here]