# Project Note – Lead Automation

---

## Tools Used

| Tool | Role |
|---|---|
| **Google Apps Script** | Runtime & orchestration layer (serverless, runs on Google's infrastructure) |
| **Google Forms** | Lead capture UI — created programmatically via `FormApp` |
| **Google Sheets** | Persistent log — linked to the form via `SpreadsheetApp` |
| **Gmail** | Email delivery via `GmailApp.sendEmail` |
| **Gemini API (`gemini-2.5-flash`)** | AI text generation — called via `UrlFetchApp` (REST) |
| **Script Properties** | Secure credential storage (API key never touches the code) |

No external libraries, no frameworks, no paid services required beyond a free Gemini API key.

---

## How It Works

```
Lead fills form
      │
      ▼
Apps Script trigger fires (onFormSubmit)
      │
      ├─► generateReply()
      │       └─► POST to Gemini API → personalised email body
      │
      ├─► GmailApp.sendEmail() → email lands in lead's inbox
      │
      └─► Sheet.getRange().setValue() → AI reply + status + timestamp logged
```

1. **`setup()`** is a one-time initialisation script. It creates the Form, links it to a Sheet, adds custom columns, and registers the trigger. After this runs, the system is fully autonomous.
2. **`onFormSubmit(e)`** is the event handler. The form event object (`e.namedValues`) contains all field values keyed by their label — no parsing needed.
3. **`generateReply()`** wraps the Gemini REST API. The prompt is carefully written to constrain the output: under 120 words, specific service reference, one clear CTA, no subject line. The API key is fetched from `PropertiesService` at runtime.
4. **Error handling**: every network call and sheet write is inside a `try/catch`. On failure, the Status column records `Error: <message>` so the sales team can manually follow up — no silent failures.

---

## Chosen Domain

**Domain 1 — Lead Automation**

This project targets the first and most time-critical step in any sales funnel: responding to a new enquiry. Studies show that leads contacted within 5 minutes are 9× more likely to convert than those contacted after 30 minutes. Manual replies at that speed are impossible for a small team. This automation closes that gap entirely, responding in under 10 seconds with a personalised, on-brand email — at zero marginal cost per lead.

---

## 30-Day Plan

### Week 1 — Foundation (Days 1–7)
- ✅ Build and test the core automation (this project)
- Deploy to a real Google Workspace account
- Share the form link on a personal or test website
- Collect 5–10 real or simulated leads to verify reliability

### Week 2 — Reliability & Monitoring (Days 8–14)
- Add a dedicated **Errors** sheet tab: any `catch` block also appends a row there with timestamp, lead email, and error message
- Set up a daily **Google Sheets email digest** (another Apps Script trigger) summarising new leads and any errors
- Test edge cases: empty budget, very long messages, invalid email addresses

### Week 3 — Prompt & Quality Improvement (Days 15–21)
- A/B test two prompt variants — log which version was used in the Sheet
- Add a `Tone` column (formal / casual) so the sales team can override the AI style per lead segment
- Review first 20–30 sent emails manually; refine the prompt based on what sounds most natural

### Week 4 — Handoff & Documentation (Days 22–30)
- Write a 1-page internal SOP: what the system does, how to check the Sheet, what to do when Status shows an error
- Record a 2-minute Loom walkthrough for teammates who didn't attend the demo
- Identify the next automation: e.g., a follow-up email 48 hours later if the lead hasn't booked a call (a second time-based trigger reading the Sheet)
- Package the whole project as a reusable template for other service businesses
