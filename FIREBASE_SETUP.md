# Firebase Setup Guide for VST MIS

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select an existing project
3. Enter project name: **"vst-mis"** (or your preferred name)
4. Disable Google Analytics (optional) or enable if you want it
5. Click **"Create project"**

## Step 2: Enable Firestore Database

1. In your Firebase project, click **"Firestore Database"** in the left menu
2. Click **"Create database"**
3. Choose **"Start in production mode"** (we'll set security rules later)
4. Select a location (choose closest to your users, e.g., `asia-south1` for India)
5. Click **"Enable"**

## Step 3: Get Service Account Key (for Backend)

1. In Firebase Console, click the **gear icon** ⚙️ next to "Project Overview"
2. Select **"Project settings"**
3. Go to **"Service accounts"** tab
4. Click **"Generate new private key"**
5. A JSON file will download - **save it as `serviceAccountKey.json`** in your project root folder (`c:\Users\siddhi\OneDrive\Desktop\MIS\`)
6. **⚠️ IMPORTANT:** Never commit this file to Git! It's already in `.gitignore`

## Step 4: Set Firestore Security Rules (Optional but Recommended)

1. In Firestore, go to **"Rules"** tab
2. Replace with these rules (allows read/write for now - adjust for production):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // For development only - restrict in production!
    }
  }
}
```

3. Click **"Publish"**

## Step 5: Install Dependencies

Run in your project folder:

```bash
npm install
```

This will install `firebase-admin` (already added to package.json).

## Step 6: Verify Setup

1. Make sure `serviceAccountKey.json` is in the project root
2. Run: `npm start`
3. Check console for: "Firebase initialized" and "VST MIS server running..."
4. Open http://localhost:3000
5. The app will automatically seed data on first run

## Troubleshooting

- **"Service account key not found"**: Make sure `serviceAccountKey.json` is in the project root folder
- **"Permission denied"**: Check Firestore security rules are published
- **"Database not found"**: Make sure Firestore is enabled in Firebase Console

## Next Steps

- Data will be stored in Firestore collections: `products`, `dealers`, `inventory`, `orders`, `production`, `kpi`
- You can view/edit data in Firebase Console → Firestore Database
- The app will work exactly the same, but data persists in the cloud!
