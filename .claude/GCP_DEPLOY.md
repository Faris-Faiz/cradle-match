# Deploying Cradle Match on GCP

Everything runs as a single Next.js app on **Cloud Run**. You need four GCP services:

| Service | What it does |
|---|---|
| Cloud Run | Hosts the Next.js app |
| Firestore | Persistent data store (replaces in-memory mock) |
| Vertex AI | Gemini 2.5 Pro for extraction + matching |
| Cloud Storage | Stores uploaded pitch deck PDFs |

Apify is third-party (not GCP) — needed only if you want live LinkedIn enrichment.

---

## Prerequisites

- GCP project created, billing enabled
- `gcloud` CLI installed and authenticated (`gcloud auth login`)
- Docker installed (Cloud Run needs a container image)
- Node.js 20+ locally for building

---

## Step 1 — Enable GCP APIs

Run once in your project:

```bash
gcloud config set project YOUR_PROJECT_ID

gcloud services enable \
  run.googleapis.com \
  firestore.googleapis.com \
  aiplatform.googleapis.com \
  storage.googleapis.com \
  artifactregistry.googleapis.com
```

---

## Step 2 — Create a Service Account

The app needs one service account with permissions to call Firestore, Vertex AI, and GCS.

```bash
gcloud iam service-accounts create cradle-match-sa \
  --display-name="Cradle Match Service Account"

# Firestore
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:cradle-match-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/datastore.user"

# Vertex AI / Gemini
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:cradle-match-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

# Cloud Storage
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:cradle-match-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"
```

Download the key (only needed if you're **not** deploying to Cloud Run — Cloud Run can use the SA directly):

```bash
gcloud iam service-accounts keys create service-account.json \
  --iam-account=cradle-match-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

Convert it to the base64 string the app expects:

```bash
base64 -i service-account.json | tr -d '\n'
```

Paste the output into `GOOGLE_APPLICATION_CREDENTIALS_JSON` in your `.env.local`.
You do **not** need this key when deploying to Cloud Run — the Cloud Run service identity handles auth automatically (see Step 5).

---

## Step 3 — Set Up Firestore

1. Go to **Firestore** in the GCP console
2. Click **Create database**
3. Choose **Native mode** (not Datastore mode)
4. Pick a region (e.g. `us-central1` — same region as Vertex AI to avoid egress)
5. Leave the database ID as `(default)` unless you change `FIRESTORE_DATABASE_ID`

---

## Step 4 — Create a GCS Bucket

```bash
gsutil mb -p YOUR_PROJECT_ID -l us-central1 gs://cradle-decks
```

If you want a different bucket name, update `GCS_BUCKET_NAME` in your env vars.

---

## Step 5 — Deploy to Cloud Run

### Build and push the image

```bash
# Create a repo in Artifact Registry
gcloud artifacts repositories create cradle-match \
  --repository-format=docker \
  --location=us-central1

# Authenticate Docker
gcloud auth configure-docker us-central1-docker.pkg.dev

# Build and push
docker build -t us-central1-docker.pkg.dev/YOUR_PROJECT_ID/cradle-match/app:latest .
docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/cradle-match/app:latest
```

### Deploy

```bash
gcloud run deploy cradle-match \
  --image=us-central1-docker.pkg.dev/YOUR_PROJECT_ID/cradle-match/app:latest \
  --region=us-central1 \
  --platform=managed \
  --allow-unauthenticated \
  --service-account=cradle-match-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  --memory=1Gi \
  --set-env-vars="MOCK_DATA_STORE=false,MOCK_EXTRACTION=false,MOCK_MATCHING=false,MOCK_ENRICHMENT=true,GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID,VERTEX_AI_LOCATION=us-central1,GEMINI_MODEL=gemini-2.5-pro,FIRESTORE_DATABASE_ID=(default),GCS_BUCKET_NAME=cradle-decks,NEXT_PUBLIC_APP_URL=https://YOUR_CLOUD_RUN_URL"
```

Because the service runs as `cradle-match-sa`, you do **not** need to pass `GOOGLE_APPLICATION_CREDENTIALS_JSON` — Cloud Run injects credentials automatically for the bound service account.

After deploy, GCP prints the service URL. Paste it into `NEXT_PUBLIC_APP_URL`.

### Seed Firestore

Hit this once after the first deploy to load the initial data:

```bash
curl -X POST https://YOUR_CLOUD_RUN_URL/api/seed
```

---

## Step 6 — Add a Dockerfile

The project doesn't have one yet. Add this to the repo root:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

And enable standalone output in `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  output: "standalone",
};
```

---

## .env.local — What to fill in

Copy `.env.example` to `.env.local` and fill in the values below.
Anything left blank stays in mock mode.

### Minimal — mock everything (no GCP needed, runs locally)

```env
MOCK_DATA_STORE=true
MOCK_EXTRACTION=true
MOCK_ENRICHMENT=true
MOCK_MATCHING=true

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Full live — all integrations enabled

```env
# ── Toggle all live integrations ──
MOCK_DATA_STORE=false
MOCK_EXTRACTION=false
MOCK_ENRICHMENT=false
MOCK_MATCHING=false

# ── GCP ──
GOOGLE_CLOUD_PROJECT=your-gcp-project-id

# Only needed locally (not on Cloud Run — Cloud Run uses the bound SA)
GOOGLE_APPLICATION_CREDENTIALS_JSON=<base64 output from Step 2>

# ── Vertex AI ──
VERTEX_AI_LOCATION=us-central1
GEMINI_MODEL=gemini-2.5-pro

# ── Firestore ──
FIRESTORE_DATABASE_ID=(default)

# ── Cloud Storage ──
GCS_BUCKET_NAME=cradle-decks

# ── Apify (LinkedIn enrichment) ──
APIFY_API_TOKEN=your-apify-token
APIFY_ACTOR_ID=johnvc/linkedin-profile-api

# ── App URL ──
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Partial — live Firestore + Gemini, mock enrichment (recommended for dev)

```env
MOCK_DATA_STORE=false
MOCK_EXTRACTION=false
MOCK_ENRICHMENT=true     # skip Apify, use hardcoded CEO bio
MOCK_MATCHING=false

GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GOOGLE_APPLICATION_CREDENTIALS_JSON=<base64 string>
VERTEX_AI_LOCATION=us-central1
GEMINI_MODEL=gemini-2.5-pro
FIRESTORE_DATABASE_ID=(default)
GCS_BUCKET_NAME=cradle-decks

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Apify token (if using live enrichment)

1. Sign up at [apify.com](https://apify.com)
2. Go to **Settings → Integrations → API tokens**
3. Create a token and paste it into `APIFY_API_TOKEN`
4. Leave `APIFY_ACTOR_ID=johnvc/linkedin-profile-api` as-is

---

## Cost notes

- **Firestore**: free tier covers ~50k reads/day — more than enough for a demo
- **Vertex AI**: Gemini 2.5 Pro charges per token; a typical match run costs < $0.05
- **Cloud Run**: free tier is 2M requests/month; scales to zero when idle
- **Cloud Storage**: negligible for a handful of PDFs
