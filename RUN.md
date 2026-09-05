# Smart CRM Run Guide

## 1. Prerequisites
- Node.js and npm installed
- MySQL server installed and running locally
- A terminal opened in the project root: `c:\Users\nakul\OneDrive\Documents\Third Year\DBMS\Mini_Project`

## 2. Install Dependencies
```bash
npm install
```

## 3. Configure Environment
Create or update `.env` with MySQL connection settings if required.
Common values:
```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=smart_crm
API_PORT=4000
WEB_ORIGIN=http://localhost:5173
```

## 4. Initialize the Database
Run the database setup script to create schema, indexes, views, and seed data:
```bash
npm run db:setup
```

## 5. Start the Backend API
```bash
npm run dev:server
```
The backend will start on `http://localhost:4000`.

## 6. Start the Frontend
In a second terminal:
```bash
npm run dev
```
The frontend will start on `http://localhost:5173`.

## 7. Verify the Application
- Open the frontend in your browser
- Confirm the dashboard loads and data displays
- Visit Customers, Leads, Deals, and Tasks pages
- Ensure API calls are successful and the app shows seeded CRM records

## 8. Helpful Commands
- Run both frontend and API together:
  ```bash
  npm run dev:all
  ```
- Build for production:
  ```bash
  npm run build
  ```
- Run type check:
  ```bash
  npm run check
  ```
- Run lint:
  ```bash
  npm run lint
  ```

## 9. Notes
- The backend uses Express and MySQL.
- The frontend uses Vite with React and Tailwind CSS.
- Database setup is automated by `scripts/setup_db.ts`.
