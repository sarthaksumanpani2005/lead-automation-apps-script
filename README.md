# Lead Automation – Google Apps Script

> **Built for:** Interview Demo · Domain 1: Lead Automation  
> **Stack:** Google Apps Script · Google Forms · Google Sheets · Gmail · Gemini AI  
> **Size:** 1 file · ~120 lines · Zero external dependencies

---

## What It Does

Most businesses lose leads simply by responding too slowly. Studies show leads contacted within **5 minutes** are **9× more likely to convert** than those followed up after 30 minutes. Manual replies at that speed are impossible for a small team.

This project solves that with a fully automated pipeline:

```
Lead fills Google Form
        │
        ▼
Apps Script trigger fires instantly
        │
        ├── Gemini AI writes a warm, personalised email (< 10 seconds)
        │       └── References the lead's specific service, message & budget
        │
        ├── Gmail sends the email to the lead automatically
        │
        └── Google Sheet logs the AI reply, status & timestamp
```

**Result:** Every new lead gets a personalised, on-brand reply in under 10 seconds — at zero marginal cost per lead.

---

## Features

- 📋 **Google Form** — 5-field lead capture form (Name, Email, Service, Budget, Message), created programmatically
- 🤖 **Gemini AI** (`gemini-3.5-flash`) — generates a unique, personalised email for each lead referencing their specific enquiry
- 📧 **Auto email** — sent via Gmail the moment the form is submitted
- 📊 **Google Sheet logging** — every lead logged with AI reply, `Email sent` status, and timestamp
- 🛡️ **Error-safe** — `try/catch` on every step; failures written to the Sheet so no lead is ever silently lost
- 🔑 **Secure** — API key stored in Script Properties, never in code
- 🧪 **`testRun()` function** — demo without filling the form

---

A single-file Apps Script project that:
- Presents a **Google Form** to capture leads
- Calls the **Gemini API** to generate a personalised reply
- **Emails** the lead automatically
- **Logs** everything in a linked Google Sheet

---

## 5-Step Setup

### 1 · Create the Apps Script project
1. Go to [script.google.com](https://script.google.com) and click **New project**.
2. Rename it to something like `Lead Automation`.
3. Delete the default `myFunction` placeholder.

### 2 · Paste the code
1. Open `Code.gs` in this repo.
2. Copy the entire file contents.
3. Paste it into the `Code.gs` editor tab in Apps Script.
4. Update the three constants at the top to match your company:
   ```js
   const MODEL        = "gemini-2.5-flash";   // Gemini model to use
   const COMPANY_NAME = "Your Company";        // Your business name
   const CTA_LINK     = "https://calendly.com/yourname/15min"; // Your booking link
   ```
5. Click **Save** (Ctrl+S / ⌘S).

### 3 · Add your Gemini API key
1. In the Apps Script editor, click **Project Settings** (gear icon, left sidebar).
2. Scroll to **Script Properties** → click **Add script property**.
3. Property name: `GEMINI_KEY` | Value: your Gemini API key.
4. Click **Save script properties**.

> Get a free API key at [aistudio.google.com](https://aistudio.google.com) → **Get API key**.

### 4 · Run `setup()` and approve permissions
1. In the editor toolbar, select the function **`setup`** from the dropdown.
2. Click **▶ Run**.
3. Google will ask for permissions — click **Review permissions → Allow**.
4. Open the **Execution log** (bottom panel) — you will see the Form URL, Edit URL, and Sheet URL printed there. Open them to confirm everything was created.

### 5 · Run `testRun()` and verify
1. Select **`testRun`** from the function dropdown and click **▶ Run**.
2. Check your inbox — you should receive a personalised email within seconds.
3. Open the linked Google Sheet — you should see the lead row with the AI reply, status `Email sent`, and a timestamp.

---

## 3-Minute Demo Script

> *Use this word-for-word during your interview presentation.*

---

**[0:00 – 0:20] Open with the problem**

> "Every business gets enquiries through a contact form. The challenge is responding fast and personally when you have dozens of leads. This project automates that entire flow with about 100 lines of Google Apps Script."

---

**[0:20 – 0:50] Walk through the code (Code.gs open in editor)**

> "There are four functions. At the top, three config constants — the AI model, our company name, and our booking link. That's the only place you ever need to edit.

> `setup()` runs once: it creates the form with five fields, links it to a Sheet, adds three custom columns, and creates the trigger that fires on every submission.

> `generateReply()` talks to the Gemini API — the API key is stored in Script Properties, never in the code. It sends a structured prompt and returns just the email body.

> `onFormSubmit()` orchestrates everything: it reads the lead's answers, calls `generateReply`, sends the email via Gmail, and writes the AI reply plus status back into the Sheet. Everything is wrapped in try/catch so if anything fails, the error is written to the Sheet — no lead is ever silently lost.

> `testRun()` simulates a submission with fake data so I can demo without touching the live form."

---

**[0:50 – 1:30] Live demo**

> "I already ran `setup()` — here's the form [open form URL], and here's the Sheet [open Sheet]. Now I'll run `testRun()`."

*(Run `testRun()` → switch to inbox)*

> "And the email is already here — personalised, mentions AI Automation, and gives a clear next step with the booking link."

*(Switch to Sheet)*

> "The Sheet logged the AI response, status, and timestamp automatically."

---

**[1:30 – 2:00] Wrap up**

> "In production you'd share the form link on your website. Every new submission triggers this automatically — no manual follow-up needed. The whole thing is one file, zero external dependencies, and runs entirely on Google's free infrastructure."

---

**[2:00 – 3:00] Q&A buffer**

Common questions and answers:
- *"What if the API call fails?"* → The catch block writes `Error: <message>` to the Status column. No lead is lost.
- *"Can it handle multiple submissions at once?"* → Apps Script triggers are event-driven and run independently per submission.
- *"How do you scale this?"* → For high volume, replace Gmail with SendGrid via UrlFetchApp, and add a column for lead scoring.
