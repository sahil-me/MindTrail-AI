# MindTrail AI - Journal & Reflections

A user-authenticated journaling and reflective conversation web application built with **Google Gemini 3.6 Flash**, **Firebase Authentication (Google Identity)**, and **Cloud Firestore**, connected to Firebase Project **`mindtrail-ai-81af2`** (Project Number: `848027673607`) with custom Firestore Database ID **`ai-studio-mindtrailai-08757021-c5f8-4096-8594-aefbe199731f`**.

---

## 1. Architecture & Security Model

- **Authentication**: Two-provider Firebase Authentication:
  - **Google Identity**: One-click OAuth popup flow (`signInWithPopup`).
  - **Email & Password**: Account registration with mandatory verification email (`createUserWithEmailAndPassword` + `sendEmailVerification`), password login (`signInWithEmailAndPassword`), and self-service password reset (`sendPasswordResetEmail`). Access to private reflections is blocked until email verification is confirmed.
- **Data Isolation**: Regardless of authentication provider, all user journals and multi-turn reflections are partitioned strictly under `/users/{userId}/entries` where `{userId}` is the authenticated Firebase UID.
- **Database Rules**: Cloud Firestore security rules strictly mandate `request.auth != null && request.auth.uid == userId`.
- **AI Processing**: Full-stack Express backend proxies all Gemini calls using `@google/genai` with an automated 4-tier model fallback ladder (`gemini-3.6-flash` &rarr; `gemini-3.1-flash-lite` &rarr; `gemini-flash-latest` &rarr; `gemini-3.7-flash`).
- **Secret Hygiene**: `GEMINI_API_KEY` is kept server-side and never exposed to the client bundle. Passwords and credentials are never stored in Firestore or localStorage.
- **Ask My Memories Engine**: Secure server-side endpoint (`/api/gemini/ask-memories`) verifies user's Firebase ID token via Identity Toolkit, strictly scopes memory queries to `/users/{verifiedUid}/entries`, and generates grounded personal pattern analysis with Gemini.
- **Reflective Reading & Curated Literature**: Discover books aligned with your journal themes and emotional tone using Google Books API with thematic synthesis.
- **Account Deletion & Data Wipe**: Authenticated users can permanently delete their account and associated entries under `/users/{uid}/entries` via the Account & Security modal with explicit typed confirmation (`DELETE`).

---

## 2. Firebase Console Configuration Requirements

Ensure the following sign-in providers are enabled in your Firebase Console (**Authentication** &rarr; **Sign-in method**):

1. **Google**: Enabled (Client ID configured in OAuth consent screen).
2. **Email/Password**: Enabled (under Email/Password, turn on the "Email/Password" toggle).
3. **Authorized Domains**: Add your application deployment domain (e.g., `ais-dev-*.run.app` and Cloud Run service URL) to **Authentication** &rarr; **Settings** &rarr; **Authorized domains**.

---

## 3. Environment & Prerequisites

### 3.1 Enable Google Cloud APIs
Ensure the necessary Google Cloud services are enabled for your GCP project:

```bash
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com
```

### 3.2 Install Dependencies Locally
```bash
npm install
```

---

## 4. Secret Management Setup (Google Secret Manager)

Create and populate the `GEMINI_API_KEY` secret in Google Cloud Secret Manager:

```bash
# 1. Create the secret container
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"

# 2. Add your Gemini API key value
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 3. Grant the Cloud Run default service account permission to read the secret
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")

gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 5. Database Security Configuration (Cloud Firestore)

Deploy the following owner-bound security rules to ensure user data isolation:

### `firestore.rules`
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/entries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Deploy the rules using the Firebase CLI or Google Cloud Firestore console:
```bash
firebase deploy --only firestore:rules
```

### 5.2 Firebase Authentication Setup
1. **Enable Sign-in Providers**:
   - Go to **Firebase Console → Authentication → Sign-in method**.
   - Enable **Google** (Configure OAuth consent and web client ID).
   - Enable **Email/Password** (Turn on Email/Password provider toggle).
2. **Authorized Domains**:
   - In **Authentication → Settings → Authorized domains**, add your Cloud Run host domain and preview domains.

---

## 6. Cloud Run Deployment Flow

Build and deploy the containerized application to Google Cloud Run:

```bash
# 1. Build and deploy directly from source
gcloud run deploy gemini-reflections-app \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest"
```

---

## 7. Required Campaign Verification Labeling

To register the Cloud Run service for the automated challenge verification and reporting, apply the mandatory campaign label:

```bash
gcloud run services update gemini-reflections-app \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## 8. Local Development

Run the unified full-stack server (Node Express + Vite middleware):

```bash
# Create local .env file
cp .env.example .env
# Set GEMINI_API_KEY in your .env file

# Run development server on port 3000
npm run dev
```

Build for production:
```bash
npm run build
npm start
```
