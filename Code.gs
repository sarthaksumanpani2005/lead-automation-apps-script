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
  var name = "", email = "", service = "", budget = "(not provided)", message = "";

  try {
    // 1. Extract values whether from Google Form event or testRun
    if (e && e.response) {
      var itemResponses = e.response.getItemResponses();
      for (var i = 0; i < itemResponses.length; i++) {
        var title = itemResponses[i].getItem().getTitle();
        var resp = itemResponses[i].getResponse();
        if (title === "Name") name = resp;
        else if (title === "Email") email = resp;
        else if (title === "Service interested in") service = resp;
        else if (title === "Budget") budget = resp || budget;
        else if (title === "Message") message = resp;
      }
    } else if (e && e.namedValues) {
      name    = (e.namedValues["Name"]                  || [""])[0].trim();
      email   = (e.namedValues["Email"]                 || [""])[0].trim();
      service = (e.namedValues["Service interested in"] || [""])[0].trim();
      budget  = (e.namedValues["Budget"]                || [budget])[0].trim();
      message = (e.namedValues["Message"]               || [""])[0].trim();
    }

    // 2. Locate the response sheet attached to this form
    var formId = (e && e.source && e.source.getId) ? e.source.getId() : "1IIrqZs4Kkx7ojptO0_jfdMBgIo3N2f9edWU37_3uFEU";
    var form = FormApp.openById(formId);
    var ssId = form.getDestinationId();
    var sheet = SpreadsheetApp.openById(ssId).getSheets()[0];
    var lastRow = sheet.getLastRow();

    // 3. Identify our custom columns by their header names
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var aiCol = headers.indexOf("AI Response") + 1;
    var statusCol = headers.indexOf("Status") + 1;
    var sentAtCol = headers.indexOf("Sent At") + 1;

    // 4. Generate AI reply via Gemini
    var reply = generateReply(name, service, budget, message);

    // 5. Send email to the lead
    GmailApp.sendEmail(
      email,
      "Thanks for reaching out, " + name + "!",
      reply,
      { name: COMPANY_NAME }
    );

    // 6. Write results back to the sheet
    if (aiCol > 0) sheet.getRange(lastRow, aiCol).setValue(reply);
    if (statusCol > 0) sheet.getRange(lastRow, statusCol).setValue("Email sent");
    if (sentAtCol > 0) sheet.getRange(lastRow, sentAtCol).setValue(new Date().toISOString());

  } catch (err) {
    Logger.log("onFormSubmit error: " + err.message);
    try {
      var formId = (e && e.source && e.source.getId) ? e.source.getId() : "1IIrqZs4Kkx7ojptO0_jfdMBgIo3N2f9edWU37_3uFEU";
      var form = FormApp.openById(formId);
      var sheet = SpreadsheetApp.openById(form.getDestinationId()).getSheets()[0];
      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      var statusCol = headers.indexOf("Status") + 1;
      if (statusCol > 0) sheet.getRange(sheet.getLastRow(), statusCol).setValue("Error: " + err.message);
    } catch (e2) {}
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
