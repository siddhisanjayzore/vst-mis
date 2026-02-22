# Why It Works Locally But Not on GitHub Pages

## What’s going on

- **Locally:** You run `node server.js`. That starts Express and your API, so `/api/auth/login`, `/api/auth/register`, etc. exist and work.
- **GitHub Pages:** Only **static files** (HTML, CSS, JS) are served. **No Node.js, no Express, no API.** So:
  - **404 favicon** – There was no favicon; that’s now fixed with an inline favicon.
  - **405 on `/api/auth/login`** – The login page sends a POST to your site. On GitHub Pages there is no backend, so the request fails (405 Method Not Allowed or similar).

So the same code “works on local” but “fails on GitHub” because on GitHub the **backend is not running**.

---

## How to fix it: run the backend somewhere

You need **two** deployments:

1. **Frontend (what you already did)**  
   - Keep hosting the static site on **GitHub Pages** (HTML, CSS, JS, `config.js`).

2. **Backend (Node.js + Express)**  
   - Deploy `server.js` to a service that runs Node.js, for example:
     - **Render** (free tier): https://render.com  
     - **Railway**: https://railway.app  
     - **Vercel** (as a serverless API)

### Steps (example with Render)

1. **Deploy the backend**
   - Push your repo to GitHub (you already did).
   - On Render: New → Web Service → connect the same repo.
   - Set **Build command:** `npm install`
   - Set **Start command:** `node server.js` (or `npm start`).
   - In **Environment**, add:
     - `FIREBASE_SERVICE_ACCOUNT` = your full Firebase JSON (one line).
     - Optionally `JWT_SECRET`.
   - Deploy. You’ll get a URL like `https://vst-mis-xxxx.onrender.com`.

2. **Point the frontend to that backend**
   - In your repo, edit **`config.js`** and set:
     ```js
     window.MIS_API_URL = 'https://vst-mis-xxxx.onrender.com';
     ```
     (Use the real URL Render gives you.)
   - Commit and push. GitHub Pages will serve the updated `config.js`.

3. **CORS**
   - Your `server.js` already uses `cors()`, so requests from your GitHub Pages URL to the Render URL should be allowed.

After that:

- **GitHub Pages** = only static site (no 405 from “missing” API).
- **Render** = real API, so `/api/auth/login` and the rest work.
- **Favicon** = 404 is fixed by the inline favicon in the HTML.

---

## Summary

| Where        | What runs                         | Result                    |
|-------------|------------------------------------|---------------------------|
| Your PC     | `node server.js` + browser         | Works (API + frontend)   |
| GitHub only | Static files only, no Node         | 405 on login/register    |
| GitHub + Render (or similar) | Static on GitHub, Node on Render | Works (API + frontend)   |

So: **upload the same files you use locally**, but **deploy the backend** (e.g. Render) and set **`window.MIS_API_URL`** in `config.js` to that backend URL. Then the “problem when deploy it on github” is fixed because the API is actually running somewhere.
