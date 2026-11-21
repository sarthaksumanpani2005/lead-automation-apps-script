// ─── CONFIG ──────────────────────────────────────────────────────────────────
const MODEL        = "gemini-3.5-flash";
const COMPANY_NAME = "Your Company";
const CTA_LINK     = "https://calendly.com/yourname/15min";
// ─────────────────────────────────────────────────────────────────────────────


// Sets up the Form, Sheet, extra columns, and the submit trigger. Run once.
function setup() {
  // 1. Create the form
  var form = FormApp.create("Get in Touch");
  form.setDescription("Tell us a bit about yourself and we'll be in touch!");
  form.setCollectEmail(false); // we capture email via a dedicated field

  form.addTextItem()
      .setTitle("Name")
      .setRequired(true);

  form.addTextItem()
      .setTitle("Email")
      .setRequired(true);

  form.addListItem()
      .setTitle("Service interested in")
      .setChoiceValues(["Website Development", "AI Automation", "Digital Marketing", "Other"])
      .setRequired(true);

  form.addTextItem()
      .setTitle("Budget");

  form.addParagraphTextItem()
      .setTitle("Message")
      .setRequired(true);

  // 2. Link responses to a new Google Sheet
  var ss = SpreadsheetApp.create("Get in Touch – Responses");
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  // 3. Add extra columns to the responses sheet
  var sheet = ss.getSheets()[0];
  var lastCol = sheet.getLastColumn();
  sheet.getRange(1, lastCol + 1, 1, 3)
       .setValues([["AI Response", "Status", "Sent At"]]);

  // 4. Create the installable on-submit trigger
  ScriptApp.newTrigger("onFormSubmit")
           .forForm(form)
           .onFormSubmit()
           .create();

  // 5. Log URLs so you can find everything
  Logger.log("Form public URL : " + form.getPublishedUrl());
  Logger.log("Form edit URL   : " + form.getEditUrl());
  Logger.log("Sheet URL       : " + ss.getUrl());
}


// Fires automatically on every form submission. Sends a personalised email
// and writes the AI reply + status back into the spreadsheet row.
function onFormSubmit(e) {
  // Pull named values from the form event
  var values  = e.namedValues;
  var name    = (values["Name"]                  || [""])[0].trim();
  var email   = (values["Email"]                 || [""])[0].trim();
  var service = (values["Service interested in"] || [""])[0].trim();
  var budget  = (values["Budget"]                || ["(not provided)"])[0].trim();
  var message = (values["Message"]               || [""])[0].trim();

  // Locate the response sheet attached to this form
  var formId  = e.source.getId();
  var form    = FormApp.openById(formId);
  var ssId    = form.getDestinationId();
  var sheet   = SpreadsheetApp.openById(ssId).getSheets()[0];

  // Find the row that belongs to this submission (last row with data)
  var lastRow = sheet.getLastRow();

  // Identify our custom columns by their header names
  var headers     = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var aiCol       = headers.indexOf("AI Response") + 1;
  var statusCol   = headers.indexOf("Status")      + 1;
  var sentAtCol   = headers.indexOf("Sent At")     + 1;

  try {
    // Generate a personalised reply via Gemini
    var reply = generateReply(name, service, budget, message);

    // Send the email to the lead
    GmailApp.sendEmail(
      email,
      "Thanks for reaching out, " + name + "!",
      reply,
      { name: COMPANY_NAME }
    );

    // Write results back to the sheet
    sheet.getRange(lastRow, aiCol)     .setValue(reply);
    sheet.getRange(lastRow, statusCol) .setValue("Email sent");
    sheet.getRange(lastRow, sentAtCol) .setValue(new Date().toISOString());

  } catch (err) {
    // Always surface errors in the sheet so no lead is silently lost
    sheet.getRange(lastRow, statusCol).setValue("Error: " + err.message);
    Logger.log("onFormSubmit error: " + err.message);
  }
}


// Calls the Gemini API to generate a warm, personalised sales email.
function generateReply(name, service, budget, message) {
  var apiKey = PropertiesService.getScriptProperties().getProperty("GEMINI_KEY");
  if (!apiKey) throw new Error("GEMINI_KEY not set in Script Properties.");

  var prompt =
    "You are a friendly sales assistant for " + COMPANY_NAME + ". " +
    "Write a warm, personalised email reply under 120 words to a lead named " + name + ". " +
    "They are interested in: " + service + ". " +
    "Their message was: \"" + message + "\". " +
    (budget ? "Their budget is around " + budget + ". " : "") +
    "Reference their specific service and message. " +
    "Suggest one clear next step: a 15-minute discovery call at " + CTA_LINK + ". " +
    "Sign off as 'The Team at " + COMPANY_NAME + "'. " +
    "Output ONLY the email body, no subject line, no extra commentary.";

  var payload = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  var response = UrlFetchApp.fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/" + MODEL + ":generateContent?key=" + apiKey,
    {
      method      : "post",
      contentType : "application/json",
      payload     : JSON.stringify(payload),
      muteHttpExceptions: true
    }
  );

  var json = JSON.parse(response.getContentText());

  // Validate the API response before returning
  if (!json.candidates || !json.candidates[0].content.parts[0].text) {
    throw new Error("Gemini returned an unexpected response: " + response.getContentText());
  }

  return json.candidates[0].content.parts[0].text.trim();
}


// Lists all Gemini models available for your API key. Run this to find a working model.
function listModels() {
  var apiKey = PropertiesService.getScriptProperties().getProperty("GEMINI_KEY");
  var response = UrlFetchApp.fetch(
    "https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey,
    { muteHttpExceptions: true }
  );
  var json = JSON.parse(response.getContentText());
  if (json.models) {
    json.models.forEach(function(m) { Logger.log(m.name); });
  } else {
    Logger.log(response.getContentText());
  }
}


// Simulates a form submission so you can demo without touching the form.
function testRun() {
  var myEmail = Session.getActiveUser().getEmail();

  var fakeEvent = {
    namedValues: {
      "Name"                  : ["Alex Demo"],
      "Email"                 : [myEmail],
      "Service interested in" : ["AI Automation"],
      "Budget"                : ["$2,000"],
      "Message"               : ["I want to automate my lead follow-up process."]
    },
    source: { getId: function() { return "1IIrqZs4Kkx7ojptO0_jfdMBgIo3N2f9edWU37_3uFEU"; } }
  };

  onFormSubmit(fakeEvent);
  Logger.log("testRun complete – check your inbox at " + myEmail);
}
