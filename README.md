<div align="center">

# 🤖 Lead Automation — Google Apps Script + Gemini AI

**Automatically respond to every new lead with a personalised AI-generated email — in under 10 seconds.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Google%20Apps%20Script-brightgreen)](https://script.google.com)
[![AI Model](https://img.shields.io/badge/AI-Gemini%203.5%20Flash-orange)](https://ai.google.dev)
[![Size](https://img.shields.io/badge/Codebase-1%20file%20%7C%20~120%20lines-lightgrey)]()

</div>

---

## Overview

Businesses that respond to leads within **5 minutes** are [**9× more likely to convert**](https://hbr.org/2011/03/the-short-life-of-online-sales-leads) them compared to a 30-minute response time. Manual follow-up at that speed is impossible for most teams.

This project automates the entire lead-response pipeline using **Google Apps Script**, **Gemini AI**, and **Gmail** — with zero external dependencies, no servers, and no recurring cost.

> A new form submission triggers an AI-generated personalised email reply to the lead and logs the interaction in a Google Sheet — fully automatically.

---

## How It Works

```
┌─────────────────────┐
│   Google Form       │  ← Lead fills in Name, Email, Service, Budget, Message
└────────┬────────────┘
         │  on submit (trigger)
         ▼
┌─────────────────────┐
│  Apps Script        │
│  onFormSubmit()     │  ← Reads lead data from the form event
└────────┬────────────┘
         │
         ├──────────────────────────────────────────┐
         │                                          ▼
         │                               ┌─────────────────────┐
         │                               │   Gemini AI API     │
         │                               │  gemini-3.5-flash   │  ← Generates personalised email
         │                               └──────────┬──────────┘
         │                                          │
         ◄──────────────────────────────────────────┘
         │
         ├──► GmailApp.sendEmail()       ← Sends reply to the lead
         │
         └──► Google Sheet              ← Logs AI reply, status & timestamp
```

---

## Features

| Feature | Detail |
|---|---|
| 📋 **Lead Capture Form** | 5-field Google Form created programmatically via `FormApp` |
| 🤖 **AI-Generated Replies** | Gemini AI writes a warm, personalised email under 120 words |
| 📧 **Automatic Email** | Sent via `GmailApp` the moment the form is submitted |
| 📊 **Google Sheet Logging** | Every lead logged with AI reply, status, and timestamp |
| 🛡️ **Error Handling** | `try/catch` on every step — failures written to Sheet, no silent loss |
| 🔑 **Secure by Design** | API key stored in Script Properties, never in source code |
| 🧪 **Test Mode** | `testRun()` simulates a submission for demos without touching the live form |
| ⚡ **Zero Dependencies** | No external libraries, no frameworks, no servers — runs entirely on Google infrastructure |

---

## Tech Stack

- **[Google Apps Script](https://script.google.com)** — Serverless runtime & orchestration
- **[Google Forms](https://forms.google.com)** — Lead capture UI
- **[Google Sheets](https://sheets.google.com)** — Persistent data log
- **[Gmail](https://mail.google.com)** — Email delivery
- **[Gemini API](https://ai.google.dev)** (`gemini-3.5-flash`) — AI text generation via REST

---

## Project Structure

```
lead-automation-apps-script/
├── Code.gs        # Entire project — 4 functions, ~120 lines
├── README.md      # This file
├── note.md        # Tools, architecture, domain rationale & 30-day plan
└── .gitignore
```

**The 4 functions in `Code.gs`:**

| Function | Purpose |
|---|---|
| `setup()` | Run once — creates Form, Sheet, columns, and trigger |
| `onFormSubmit(e)` | Event handler — orchestrates the full pipeline on each submission |
| `generateReply()` | Calls Gemini API and returns the personalised email body |
| `testRun()` | Simulates a submission for local testing and demos |

---

## Getting Started

### Prerequisites

- A Google account
- A free [Gemini API key](https://aistudio.google.com/apikey) from Google AI Studio

### Setup (5 Steps)

**1. Create the Apps Script project**

Go to [script.google.com](https://script.google.com) → click **New project** → rename it to `Lead Automation`.

**2. Paste the code**

Delete the default content in `Code.gs`, paste in the contents of [`Code.gs`](Code.gs) from this repo, and update the three constants at the top:

```js
const MODEL        = "gemini-3.5-flash";          // Gemini model
const COMPANY_NAME = "Your Company";              // Your business name
const CTA_LINK     = "https://calendly.com/you";  // Your booking link
```

Press `Ctrl+S` to save.

**3. Add your Gemini API key**

In the Apps Script editor → **⚙️ Project Settings** → **Script Properties** → **Add script property**:

| Property | Value |
|---|---|
| `GEMINI_KEY` | `your-api-key-here` |

**4. Run `setup()`**

Select `setup` from the function dropdown → click **▶ Run** → approve permissions when prompted.

The execution log will print your Form URL, Edit URL, and Sheet URL.

**5. Test with `testRun()`**

Select `testRun` → click **▶ Run**. Check your inbox — a personalised AI email should arrive within seconds. The Sheet will also log the entry automatically.

---

## Configuration

All configurable values are grouped at the top of `Code.gs`:

```js
const MODEL        = "gemini-3.5-flash";
const COMPANY_NAME = "Your Company";
const CTA_LINK     = "https://calendly.com/yourname/15min";
```

The API key is **never** stored in code — it is read at runtime from Script Properties via:
```js
PropertiesService.getScriptProperties().getProperty("GEMINI_KEY");
```

---

## Security

- ✅ API key stored in Script Properties — not in source code
- ✅ No hardcoded credentials anywhere in the codebase
- ✅ `.gitignore` excludes any local `.env` files
- ✅ Apps Script runs under your Google account with explicit OAuth scopes

---

## License

This project is licensed under the [MIT License](LICENSE) — feel free to use, modify, and distribute it.

---

<div align="center">
  Built with ❤️ using Google Apps Script &amp; Gemini AI
</div>
