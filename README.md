# VST Tillers Tractors - Management Information System (MIS)

A Management Information System for VST Tillers Tractors Ltd. with **Firebase Firestore** for cloud-based persistent storage. The app can run with the backend (full database) or as a static demo using fallback data.

## Features

- **Dashboard** – KPIs, monthly sales chart, product mix chart, recent orders, low-stock alerts
- **Sales & Orders** – Add orders, change status, search/filter, sort, export CSV
- **Inventory** – Adjust stock, sort, export CSV, reorder alerts
- **Production** – Line utilization, production schedule
- **Dealers** – Add dealers, search/filter by region, sort, export CSV
- **Reports** – Report cards with previews
- **Database** – Firebase Firestore (cloud database); data persists in the cloud

## Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (vanilla)
- **Backend:** Node.js, Express
- **Database:** Firebase Firestore (cloud)

## Quick Start

### Option 1: With Firebase (Recommended)

1. **Set up Firebase** (one-time setup):
   - Follow the detailed guide in **[FIREBASE_SETUP.md](FIREBASE_SETUP.md)**
   - Create a Firebase project, enable Firestore, download `serviceAccountKey.json`
   - Place `serviceAccountKey.json` in the project root folder

2. **Install and run:**
   ```bash
   npm install
   npm start
   ```

3. Open **http://localhost:3000** in your browser.

4. Data will be automatically seeded on first run and stored in Firebase Firestore.

### Option 2: Without Database (Static Demo)

- Open `index.html` directly in a browser (double-click or File → Open). The app will use static data from `data.js`. Add/Edit actions will only update in-memory until you refresh.

## Project Structure

```
MIS/
├── index.html              # Single-page app
├── styles.css              # Layout and theme
├── data.js                 # Fallback/seed data (used when API unavailable)
├── app.js                  # Frontend logic, API calls, rendering
├── server.js               # Express server + Firebase API
├── package.json            # Dependencies (express, cors, firebase-admin)
├── serviceAccountKey.json  # Firebase service account (not in Git)
├── FIREBASE_SETUP.md       # Detailed Firebase setup guide
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/data` | All data (orders, dealers, inventory, products, KPI, etc.) |
| GET | `/api/next-order-id` | Next order ID for new orders |
| POST | `/api/orders` | Create order |
| PATCH | `/api/orders/:id/status` | Update order status |
| POST | `/api/dealers` | Add dealer |
| PATCH | `/api/inventory/:sku/stock` | Adjust stock by delta |

## Database (Firebase Firestore)

- **Collections:** `products`, `dealers`, `inventory`, `orders`, `production`, `kpi`
- **Location:** Cloud (Firebase Firestore)
- Data is seeded automatically on first run. You can view/edit data in Firebase Console → Firestore Database.
- **Security:** Make sure to configure Firestore security rules in Firebase Console (see FIREBASE_SETUP.md).

## Setup Steps Summary

1. **Create Firebase Project** → [Firebase Console](https://console.firebase.google.com/)
2. **Enable Firestore Database** → Start in production mode
3. **Download Service Account Key** → Save as `serviceAccountKey.json` in project root
4. **Install dependencies** → `npm install`
5. **Run server** → `npm start`
6. **Open app** → http://localhost:3000

For detailed instructions, see **[FIREBASE_SETUP.md](FIREBASE_SETUP.md)**.

## Security Notes

⚠️ **IMPORTANT:** 
- **Never commit `serviceAccountKey.json` to Git** - it's already in `.gitignore`
- If you accidentally committed it, remove it from Git history immediately
- For production, use environment variables instead of the file (see `server.js`)

## Note

When the server is running with Firebase, all create/update actions (new order, new dealer, stock adjustment, order status) are saved to Firebase Firestore and persist in the cloud. If you open the app without the server, it uses static data from `data.js` and changes are lost on refresh.
