This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## GCP Setup
GCP project:

```text
Project ID: cradle-hackathon
Project name: Cradle Hackathon
```

Install dependencies:

```bash
npm install
```

Create your local env file:

```bash
cp .env.example .env.local
```

Use this baseline in `.env.local` for live backend development:

```env
MOCK_DATA_STORE=false
MOCK_EXTRACTION=false
MOCK_ENRICHMENT=true
MOCK_MATCHING=false

GOOGLE_CLOUD_PROJECT=cradle-hackathon
VERTEX_AI_LOCATION=us-central1
GEMINI_MODEL=gemini-2.5-flash
FIRESTORE_DATABASE_ID=(default)
GCS_BUCKET_NAME=cradle-hackathon-decks
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Do not commit `.env`, `.env.local`, service account JSON files, or private keys.

### GCP local auth

Install Google Cloud CLI, then run:

```bash
gcloud auth login
gcloud config set project cradle-hackathon
gcloud auth application-default login
```

For local Firestore access, you may also need a service account key from the project owner:

```env
GOOGLE_APPLICATION_CREDENTIALS_JSON=<base64-service-account-json>
```

### Run locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Seed Firestore

If Firestore is empty:

```bash
curl -X POST http://localhost:3000/api/seed
```

### Key files

- PDF extraction: `lib/services/extraction.ts`
- Company upload API: `app/api/companies/route.ts`
- Firestore data layer: `lib/services/data.ts`
- Gemini matching: `lib/services/matching.ts`