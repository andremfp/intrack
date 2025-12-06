# InTrack

InTrack helps Portuguese Medical residents track consultations and milestones, allowing them to centralize data in and retrieve valuable insights from a single source, so they can focus on learning and helping patients instead of spreadsheets.  
**The UI is intentionally in Portuguese** to use the official terminology of Portuguese health professionals.

## Features

- Authentication (email/password + Google).
- Specialty-aware consultation registry forms (currently just for Family Medicine).
- Consultations table with pagination, rich filters, and bulk delete actions.
- Dashboard with time-series trends, breakdown charts, etc.
- Responsive layout, light/dark theme toggle.

## Tech Stack

- **Frontend**: React, TypeScript.
- **UI**: Tailwind CSS, shadcn/ui.
- **Backend & Data**: Supabase.

## Deploy locally

1. Install dependencies:

   ```bash
   git clone https://github.com/andremfp/intrack.git
   cd intrack
   npm install
   ```

2. Start Supabase locally and configure environment variables:

   ```bash
   npm run sb:local:start  # Starts local Supabase services
   ```

   Create `.env.local` with local Supabase credentials:

   ```bash
   VITE_SUPABASE_URL=http://127.0.0.1:54321
   VITE_SUPABASE_SECRET=sb_secret_...
   ```

3. Seed the local database with users (if needed):

   ```bash
   npm run sb:local:db:seed:users
   ```

4. Run the dev server:
   ```bash
   npm run dev
   ```

## License

MIT © 2025
