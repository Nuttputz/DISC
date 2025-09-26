# DISC (Vite + React + Tailwind)

A ready-to-deploy DISC web app scaffold. Replace `src/App.jsx` to customize.

## Local Development
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## GitHub Pages Deployment (via Actions)
1. Create a new **public** GitHub repository named **DISC**.
2. Push this project to the repo.
3. Ensure `vite.config.js` has `base: '/DISC/'` (or `/<repo>/` if repo name differs).
4. The included workflow `.github/workflows/deploy.yml` builds and deploys to GitHub Pages.
5. In GitHub repo → **Settings** → **Pages** → **Build and deployment** → **Source: GitHub Actions**.
6. Wait for the workflow to pass, then visit: `https://<your-username>.github.io/DISC/`.
