# Smart Attendance Manager (SaaS)

A multi-tenant attendance system using React, Google Sheets, and Google Apps Script.

## Architecture
- **Frontend:** React + Tailwind CSS (Vercel/Netlify)
- **Backend:** Google Apps Script (Web App)
- **Database:** Google Sheets (One Master + One per Tenant)

## Deployment Guide

### Phase 1: Google Cloud & Auth
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Navigate to **APIs & Services > OAuth consent screen**.
   - User Type: External.
   - Fill in app name and email.
4. Navigate to **Credentials**.
   - Create Credentials > OAuth Client ID > Web Application.
   - Add Authorized JS Origins: `http://localhost:3000` (and your production URL later).
   - Copy the **Client ID**.

### Phase 2: Backend (Google Apps Script)
1. Go to [script.google.com](https://script.google.com/).
2. Create a new project.
3. Copy the content of `backend/Code.js` into `Code.gs`.
4. Run the function `setupMasterSheet()` once from the editor.
5. **View Logs** (Cmd+Enter) to get the `Master Sheet Created ID`.
6. Replace `MASTER_SHEET_ID` variable at the top of `Code.gs` with this ID.
7. Set Script Property:
   - File > Project Settings > Script Properties.
   - Add `SUPER_ADMIN_EMAIL` = `your-email@gmail.com`.
8. **Deploy**:
   - Click "Deploy" > "New deployment".
   - Select type: "Web app".
   - Description: "v1".
   - Execute as: **Me** (your account).
   - Who has access: **Anyone** (Important: The frontend sends the token for verification).
   - Copy the **Web App URL**.

### Phase 3: Frontend Configuration
1. Open `constants.ts`.
2. Replace `GOOGLE_CLIENT_ID` with the ID from Phase 1.
3. Replace `APPS_SCRIPT_URL` with the URL from Phase 2.

### Phase 4: Running
1. `npm install`
2. `npm start`
3. Login with the email set as `SUPER_ADMIN_EMAIL`.
4. Go to Super Admin Dashboard -> Create New Institution.
   - Enter a name and a *different* email for the Institution Admin.
5. Login with the Institution Admin email to test the Principal Dashboard (Default PIN: 123456).

## Security Note
This is a prototype architecture. For production:
1. Verify Google ID Tokens using `UrlFetchApp` to `https://oauth2.googleapis.com/tokeninfo`.
2. Implement strict row-level security or use a SQL database if data grows beyond 5M cells.
