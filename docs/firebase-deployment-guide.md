# FEEA Cloud Deployment (Firebase + Docker) — Beginner Walkthrough

This guide shows how to put the FEEA system online using Firebase as the public entry point and Google Cloud Run for the Dockerized backend. It is written for beginners and avoids jargon. Follow the steps in order.

## 0) What you get after finishing
- A live HTTPS URL for the web dashboard (served by Firebase Hosting).
- A live HTTPS API endpoint for the NestJS backend (running on Cloud Run with a Docker container).
- Environment variables set for M-Pesa sandbox, Redis, and JWT secrets.
- A repeatable way to update the app (build → push → deploy).

## 1) One-time prerequisites
1. Create a free Google account if you do not have one.
2. Install basic tools on your laptop/VM:
   - **Node.js 18+** and **npm**
   - **Git**
   - **Docker Desktop** (or Docker CLI) and ensure it is running
   - **Firebase CLI**: `npm install -g firebase-tools`
   - **Google Cloud SDK**: https://cloud.google.com/sdk/docs/install
3. Make sure you can sign in to the Firebase console: https://console.firebase.google.com
4. Make sure you can sign in to the Google Cloud console: https://console.cloud.google.com

## 2) Create and link your Firebase & Cloud project
1. In the Firebase console, click **Add project** → give it a name (e.g., `feea-prod`).
2. Enable **Google Analytics** only if you want usage metrics; it is optional.
3. After the project is created, click **Project settings → Your apps → Web** and register a web app (you only need the project to exist; no code changes yet).
4. In the Google Cloud console, open **APIs & Services** and enable:
   - **Cloud Run API**
   - **Cloud Build API**
   - **Artifact Registry API** (for storing Docker images)
5. Open **IAM & Admin → Service Accounts** and note the default service account (e.g., `PROJECT_NUMBER-compute@developer.gserviceaccount.com`). It will be used by Cloud Run.

## 3) Clone the code locally
```bash
git clone <your-repo-url> feea
cd feea
```

## 4) Prepare environment variables
Create a file named `.env.production` inside the `backend/` folder with real values:
```
PORT=8080
JWT_SECRET=change_me_to_a_long_random_string
REDIS_URL=redis://<redis-host>:6379
MPESA_CONSUMER_KEY=your_safaricom_key
MPESA_CONSUMER_SECRET=your_safaricom_secret
MPESA_SHORTCODE=600000
MPESA_PASSKEY=your_online_passkey
MPESA_ENV=sandbox
BASE_CALLBACK_URL=https://<your-domain>/api/mpesa
```
If you do not have Redis yet, you can use the free **Redis Cloud** tier or Google Memorystore. Update `REDIS_URL` accordingly.

## 5) Build and push the backend Docker image
We will store the image in Google Artifact Registry (same as Container Registry replacement).

1. Authenticate your terminal to Google Cloud:
   ```bash
   gcloud auth login
   gcloud auth configure-docker
   gcloud config set project <your-gcp-project-id>
   ```
2. From the repo root, build the backend image:
   ```bash
   cd backend
   docker build -t gcr.io/<your-gcp-project-id>/feea-backend:latest .
   ```
3. Push the image to Artifact/Container Registry:
   ```bash
   docker push gcr.io/<your-gcp-project-id>/feea-backend:latest
   ```

## 6) Deploy the backend to Cloud Run
1. Still in the `backend/` folder, run:
   ```bash
   gcloud run deploy feea-backend \
     --image gcr.io/<your-gcp-project-id>/feea-backend:latest \
     --platform managed \
     --region <your-preferred-region> \
     --allow-unauthenticated \
     --port 8080 \
     --set-env-vars PORT=8080,JWT_SECRET=<same-as-env-file>,REDIS_URL=<redis-url>,MPESA_CONSUMER_KEY=<value>,MPESA_CONSUMER_SECRET=<value>,MPESA_SHORTCODE=<value>,MPESA_PASSKEY=<value>,MPESA_ENV=sandbox,BASE_CALLBACK_URL=https://<your-domain>/api/mpesa
   ```
2. Wait for the deploy to finish and copy the **Service URL** (e.g., `https://feea-backend-xxxxx.run.app`). This is your live API URL.

## 7) Configure Firebase Hosting to proxy to Cloud Run
We will serve the Next.js dashboard from Firebase Hosting and forward API calls to Cloud Run.

1. From the repo root, go to the dashboard app and install dependencies (optional but recommended for local builds):
   ```bash
   cd ../next-dashboard
   npm install
   npm run build   # ensures the app can build locally
   cd ..
   ```
2. Initialize Firebase in the repo root:
   ```bash
   firebase login
   firebase init hosting
   ```
   - Choose the existing project (`feea-prod`).
   - Set `public` directory to `next-dashboard/out` (we will use Next.js static export).
   - Choose **Configure as a single-page app** → **No**.
   - Do **not** overwrite existing files unless you intend to.
3. Export the Next.js dashboard to static files (suitable for Firebase Hosting):
   ```bash
   cd next-dashboard
   npm run export
   cd ..
   ```
   This creates `next-dashboard/out` with static assets.
4. Create or edit `firebase.json` in the repo root to add a rewrite for API calls:
   ```json
   {
     "hosting": {
       "public": "next-dashboard/out",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         { "source": "/api/**", "run": { "serviceId": "feea-backend" } }
       ]
     }
   }
   ```
   This means any request to `/api/*` from your site will go to the Cloud Run backend.
5. Deploy Hosting:
   ```bash
   firebase deploy --only hosting
   ```
6. After deploy, note the Firebase Hosting URL (e.g., `https://feea-prod.web.app`). API calls from the dashboard will proxy to Cloud Run using the rewrite.

## 8) Test the live system
1. Open the Hosting URL in your browser.
2. Try hitting an API endpoint directly, for example: `https://feea-prod.web.app/api/health` (adjust path to a real endpoint you have).
3. From your phone, dial your USSD short code (in sandbox use a simulator) and ensure callbacks reach `BASE_CALLBACK_URL`.
4. Perform a small M-Pesa sandbox C2B payment using your configured shortcode and confirm it appears in the system.

## 9) Routine updates
Whenever you change the backend:
```bash
cd backend
docker build -t gcr.io/<your-gcp-project-id>/feea-backend:latest .
docker push gcr.io/<your-gcp-project-id>/feea-backend:latest
gcloud run deploy feea-backend --image gcr.io/<your-gcp-project-id>/feea-backend:latest --region <region> --platform managed --allow-unauthenticated --port 8080 --set-env-vars ...
```
Whenever you change the dashboard:
```bash
cd next-dashboard
npm run export
cd ..
firebase deploy --only hosting
```

## 10) Simple checklist (print this)
- [ ] Google/Firebase project created
- [ ] Cloud Run, Cloud Build, Artifact Registry APIs enabled
- [ ] `.env.production` filled with real secrets
- [ ] Backend image built and pushed
- [ ] Cloud Run service deployed and URL noted
- [ ] `firebase.json` rewrite added for `/api/**`
- [ ] Next.js static export done (`npm run export`)
- [ ] Firebase Hosting deployed
- [ ] USSD/M-Pesa callbacks pointed to `https://<your-domain>/api/mpesa`

## 11) Rollback tip
If a backend deploy misbehaves, redeploy a previous image tag:
```bash
gcloud run deploy feea-backend --image gcr.io/<your-gcp-project-id>/feea-backend:<older-tag> --region <region> --platform managed --allow-unauthenticated
```

## 12) Where to put secrets safely
- Prefer **Cloud Secret Manager** for long-term storage of M-Pesa keys and JWT secrets.
- Update the Cloud Run service to read env vars from Secret Manager if you want zero secrets in command history.

That’s it. Follow the steps, and you will have a live FEEA deployment reachable over HTTPS with Firebase Hosting in front and Cloud Run running your NestJS backend.
