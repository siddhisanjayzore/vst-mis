# Firebase Credentials via Environment Variable

The app uses `FIREBASE_SERVICE_ACCOUNT` instead of `serviceAccountKey.json`. No JSON file needed.

## Quick Setup

### Option 1: Using .env file (Recommended)

1. **Create a `.env` file** in the project root (`c:\Users\siddhi\OneDrive\Desktop\MIS\.env`)

2. **Add your Firebase credentials** (one line, no line breaks in the JSON):

```
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"vst-mis","private_key_id":"xxx","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxx@vst-mis.iam.gserviceaccount.com","client_id":"xxx","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"xxx","universe_domain":"googleapis.com"}
```

3. **To get the JSON**:
   - Firebase Console → Project Settings → Service accounts → **Generate new private key**
   - Open the downloaded JSON
   - Minify it to one line (remove all line breaks)
   - Paste as the value of `FIREBASE_SERVICE_ACCOUNT`

### Option 2: Migrate from serviceAccountKey.json

**PowerShell** (run in project folder):
```powershell
$json = Get-Content serviceAccountKey.json -Raw
$json = $json -replace "`r`n", "" -replace "`n", ""  # Minify
Add-Content -Path .env -Value "FIREBASE_SERVICE_ACCOUNT=$json"
```

**Or manually**: Copy the entire content of `serviceAccountKey.json`, minify to one line, and paste into `.env` as `FIREBASE_SERVICE_ACCOUNT=...`

### Option 3: Set in terminal (temporary, for current session only)

**PowerShell**:
```powershell
$env:FIREBASE_SERVICE_ACCOUNT = (Get-Content serviceAccountKey.json -Raw).Replace("`n","").Replace("`r","")
node server.js
```

## Security

- `.env` is in `.gitignore` — never commit it
- You can delete `serviceAccountKey.json` after migrating to `.env`
- For production (e.g. Render, Railway), set `FIREBASE_SERVICE_ACCOUNT` in the platform's environment variables
