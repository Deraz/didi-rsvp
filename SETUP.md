# Apps Script Setup Guide

This guide walks you through deploying the RSVP backend to Google Apps Script. No coding needed — just follow the steps.

## Prerequisites

You'll need:
- A Google account (the same one you use for Gmail, Google Drive, etc.)
- Access to create Google Sheets and Apps Scripts
- A text editor or way to copy/paste the code

## Setup Steps

### Step 1: Create a Google Sheet

1. Open **[sheets.google.com](https://sheets.google.com)** in your browser
2. Click the **blue "+" button** (top left) to create a new spreadsheet
3. A new sheet opens with a default name (like "Untitled spreadsheet")
4. Click the name at the top left to rename it
5. Enter **"Didi RSVPs"** as the name
6. Press **Enter** or click elsewhere to save

Your sheet is now ready to hold RSVP responses.

### Step 2: Open Apps Script and Paste the Code

1. In your "Didi RSVPs" sheet, click the **"Extensions"** menu (top of the page)
2. Click **"Apps Script"** from the dropdown
3. A new tab opens with the Apps Script editor
4. You'll see some default code already there (a blank `function myFunction()`)
5. **Select all the default code** (Ctrl+A or Cmd+A) and **delete it**
6. Copy the entire code from the file **`apps-script/Code.gs`** (from this repo)
7. **Paste it** into the Apps Script editor
8. Click the **"Save"** button (or press Ctrl+S / Cmd+S)
9. A popup may ask you to name the project — enter **"Didi RSVP Backend"** and click **"OK"**

Your code is now saved in Apps Script.

### Step 3: Set the Admin Password

The admin password protects the ability to view all RSVPs. You'll choose your own secret word.

1. In the Apps Script editor, click the **gear icon** (⚙️) on the left sidebar — this is **"Project Settings"**
2. Scroll down to the **"Script Properties"** section
3. Click **"Add Property"**
4. In the "Property" field, enter: **`ADMIN_PASSWORD`**
5. In the "Value" field, enter your secret magic word (example: `mysecretpassword123`)
   - Choose something you'll remember, but don't use an existing password
   - Keep it to letters, numbers, and underscores only
6. Click **"Save"**

Save this password somewhere safe — you'll need it later to view the RSVP list.

### Step 4: Deploy as a Web App

1. In the Apps Script editor, click the **blue "Deploy"** button (top right)
2. Click **"New deployment"** (if you don't see it, look for a dropdown menu)
3. A popup appears asking for deployment settings:
   - **Select type:** Click the dropdown and choose **"Web app"**
   - **Execute as:** Click the dropdown and select **"Me"** (your Google account)
   - **Who has access:** Click the dropdown and select **"Anyone"**
4. Click the **"Deploy"** button
5. A popup may ask for permission — review it and click **"Authorize"** or **"Allow"**
   - You may need to select your Google account again
6. The deployment succeeds — a confirmation message appears
7. **Copy the full URL** from the message — it should look like:
   ```
   https://script.google.com/macros/d/[LONG_ID]/usercopy
   ```
   or end in `/exec`

Keep this URL handy — you'll paste it in the next step.

### Step 5: Add the URL to the Website Config

1. In your code editor (VS Code, etc.), open the file **`js/config.js`** from this repo
2. Find the line with `appsScriptUrl: ""`
3. Replace the empty quotes with your deployed URL:
   ```js
   appsScriptUrl: "https://script.google.com/macros/d/[LONG_ID]/usercopy",
   ```
   (Paste your full URL between the quotes)
4. **Save** the file

Your website is now connected to the backend.

### Step 6: Redeploy After Code Changes (Future Reference)

If you ever need to update the Apps Script code later:

1. In the Apps Script editor, make your changes
2. Click **"Deploy"** (top right)
3. Click **"Manage deployments"**
4. Find the existing deployment and click the **edit icon** (pencil)
5. Click **"Create new version"**
6. The URL stays the same — no need to update `js/config.js` again

---

## What Happens Next?

Once you've completed these 5 steps, the RSVP form on your website will:
- Accept RSVP submissions with name, attendance, guest count, and birthday wishes
- Store each submission as a new row in the "Didi RSVPs" sheet
- Allow viewing all RSVPs through a password-protected API endpoint (for the admin dashboard)

The form will automatically send data to your Apps Script backend, and responses will appear in your Google Sheet in real time.

## Troubleshooting

**Q: I can't find the Extensions menu**
- Make sure you're in a Google Sheet (sheets.google.com), not Google Docs

**Q: The Deploy button says "Manage deployments" instead of "Deploy"**
- Click "Manage deployments" and look for an option to create a new deployment

**Q: I need to change the admin password**
- Return to Project Settings → Script Properties → edit the `ADMIN_PASSWORD` property value

**Q: The URL keeps changing each time I deploy**
- If you see a different URL each time, use the latest one. If you want the same URL after code changes, follow Step 6 (Create new version) instead of creating a new deployment.
