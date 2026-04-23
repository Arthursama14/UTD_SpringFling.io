const SHEET_ID = "1qevKj7o670qjJR5uRik30gknlQAvX87rrliKdpQ-5Xk";
const API_URL = `https://opensheet.elk.sh/${SHEET_ID}/Form%20Responses%201`;

let globalData = [];

fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    globalData = data;

    buildFilters(data);
    renderGrid(data);
  });

/* ---------------------------
   BUILD FILTER OPTIONS
----------------------------*/
function buildFilters(data) {
  const objectSet = new Set();
  const tagSet = new Set();

  data.forEach(item => {
    const obj = item["What is the Object?"];
    const tags = item["What tags best describe the item and its history?"];

    if (obj) objectSet.add(obj);

    if (tags) {
      tags.split(",").forEach(t => tagSet.add(t.trim()));
    }
  });

  populateSelect("objectFilter", objectSet);
  populateSelect("tagFilter", tagSet);

  // attach listeners
  document.getElementById("objectFilter").addEventListener("change", applyFilters);
  document.getElementById("tagFilter").addEventListener("change", applyFilters);
}

/* ---------------------------
   POPULATE DROPDOWN
----------------------------*/
function populateSelect(id, values) {
  const select = document.getElementById(id);

  values.forEach(val => {
    const option = document.createElement("option");
    option.value = val;
    option.textContent = val;
    select.appendChild(option);
  });

  // grey out if no options
  if (values.size === 0) {
    const option = document.createElement("option");
    option.textContent = "No options available";
    option.disabled = true;
    select.appendChild(option);
  }
}

/* ---------------------------
   FILTER LOGIC
----------------------------*/
function applyFilters() {
  const objectVal = document.getElementById("objectFilter").value;
  const tagVal = document.getElementById("tagFilter").value;

  const filtered = globalData.filter(item => {
    const obj = item["What is the Object?"];
    const tags = item["What tags best describe the item and its history?"] || "";

    const objectMatch = objectVal === "all" || obj === objectVal;
    const tagMatch = tagVal === "all" || tags.includes(tagVal);

    return objectMatch && tagMatch;
  });

  renderGrid(filtered);
}

/* ---------------------------
   RENDER GRID
----------------------------*/
function renderGrid(data) {
  let html = "";
  let count = 0;

  data.forEach(item => {

    const listing = (item["Would you like to add an item for listing?"] || "")
      .toLowerCase()
      .includes("yes");

    const availability = (item["Mark the current availability of the item. If the item is no longer available, please resubmit an updated form."] || "")
      .toLowerCase()
      .includes("available");

    if (!listing || !availability) return;

    let image = (item["Provide images of the item in question."] || "").trim();

    if (image.includes("drive.google.com") || image.match(/[-\w]{25,}/)) {
      const match = image.match(/[-\w]{25,}/);
      if (match) {
        image = `https://lh3.googleusercontent.com/d/${match[0]}`;
      }
    }

    if (!image) {
      image = "https://via.placeholder.com/300x200?text=No+Image";
    }

    html += `
      <div class="card">
        <img src="${image}" />
        <h3>${item["What is the Object?"]}</h3>
        <p>${item["Email Address"]}</p>
      </div>
    `;

    count++;
  });

  document.getElementById("listings").innerHTML =
    count ? html : "<p>No matching items</p>";
}