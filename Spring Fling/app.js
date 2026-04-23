function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Form Responses 1");
  const data = sheet.getDataRange().getValues();

  const headers = data[0];
  const rows = data.slice(1);

  const json = rows.map(row => {
    let obj = {};

    headers.forEach((h, i) => {
      obj[h] = row[i];
    });

    return obj;
  });

  return ContentService
    .createTextOutput(JSON.stringify(json))
    .setMimeType(ContentService.MimeType.JSON);
}