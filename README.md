# Maurice Gadgets Hub - Phase 0 Project Scaffolding

This project has been set up with Next.js 15, TypeScript, Tailwind CSS, and Supabase integration.

## Getting Started

### 1. Configure Environment Variables
Open the [.env.local](file:///home/noahenemali/Documents/Maurice/.env.local) file at the root of the project and fill in your Supabase, Flutterwave, and Resend credentials.

### 2. Database Migrations
Before running migrations, **make sure you have set up your Supabase project and filled in the credentials in `.env.local`.**
To run migrations, you can copy the contents of [20260712000000_initial_schema.sql](file:///home/noahenemali/Documents/Maurice/supabase/migrations/20260712000000_initial_schema.sql) and execute them directly in the SQL Editor on your Supabase dashboard.

### 3. Run the Development Server
Install dependencies and run the development server:
```bash
npm install
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).
