# Deployment (Vercel)

This project is configured for quick deployment to Vercel (free tier).

Quick steps (CLI):

1. Install Vercel CLI (if not installed):

```
npm install -g vercel
```

2. Build the app and deploy:

```
npm run build
vercel --prod
```

Alternatively, push this repo to GitHub and connect it to Vercel for automatic deployments.

Notes:
- The app is a single-page app; `vercel.json` rewrites all routes to `index.html`.
- If you want mobile wrappers (Android/iOS), use the Capacitor projects in the repo and open them with Android Studio / Xcode.
