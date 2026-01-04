# InTrack

InTrack helps Portuguese Medical residents track consultations and milestones, allowing them to centralize data and retrieve valuable insights from a single source, so they can focus on learning and helping patients instead of managing spreadsheets.

**The UI is intentionally in Portuguese** to align with the official terminology used by Portuguese health professionals.

## ✨ Features

- **Authentication:** Email/Password and Google OAuth.
- **Specialized Forms:** Specialty-aware consultation registry (currently supporting Family Medicine / MGF).
- **Data Management:** Advanced consultations table with pagination, rich filters, and bulk actions.
- **Analytics Dashboard:** Time-series trends and breakdown charts.
- **Modern UI:** Responsive layout with light/dark theme support.

## 🛠 Tech Stack

- **Frontend:** React, TypeScript, Vite
- **UI:** Tailwind CSS, shadcn/ui
- **Backend:** Supabase
- **Infrastructure:** Vercel (Hosting), GitHub Actions (CI/CD)

## 🗺 Roadmap

- [ ] **Testing:** Add comprehensive E2E tests (Playwright/Cypress).
- [ ] **Custom Domain** Add custom domain to production.
- [ ] **Donations** Add support for donations to support the project.
- [ ] **Specialties:** Add support for more medical specialties beyond MGF.
- [ ] **Multi-Language/Translations:** Add multi-language support.

## 🤝 How to Contribute

This project follow a strict **Git Flow** process with two permanent environments to ensure stability.

### Local Development Setup

1.  **Clone & Install**

    ```bash
    git clone https://github.com/andremfp/intrack.git
    cd intrack
    npm install
    ```

2.  **Start Supabase Locally**
    This command starts the local database and runs migrations/seeds automatically. It requires Docker.

    ```bash
    npm run sb:local:start
    ```

3.  **Configure Environment**
    Create a `.env.local` file in the root directory:

    ```bash
    # Connects to your local Supabase instance
    VITE_SUPABASE_URL=http://127.0.0.1:54321
    VITE_LOCAL_SUPABASE_ANON_KEY=sb_publishable_...
    VITE_LOCAL_SUPABASE_SECRET=sb_secret_...
    ```

4.  **Run the App**
    ```bash
    npm run dev
    ```

### Development Workflow

1.  **Feature Branch:** Create a branch from `staging` (e.g., `feature/new-form`).
    ```bash
    git switch -c feature/new-form
    ```
2.  **Open PR to Staging:** Push your branch and open a Pull Request to `staging`.
3.  **Merge to Staging:** Test your changes with real data on the staging URL.
4.  **Ship to Production:**
    - **Bump Version:** Create a PR for staging to update `version` in `package.json` (e.g., `0.0.1` -> `0.0.2`).
    - Open a PR from `staging` -> `main`.
    - **Merge:** Merging to `main` deploys to Production and creates a GitHub Release.

## 📄 License

MIT © 2025
