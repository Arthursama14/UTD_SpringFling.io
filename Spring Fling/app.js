const SHEET_ID = "1qevKj7o670qjJR5uRik30gknlQAvX87rrliKdpQ-5Xk";
const API_URL = `https://opensheet.elk.sh/${SHEET_ID}/Form%20Responses%201`;

let globalData = [];

/* ---------------------------
   INIT
----------------------------*/
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
    const obj = (item["What is the Object?"] || "").trim();
    const tags = (item["What tags best describe the item and its history?"] || "").trim();

    if (obj) objectSet.add(obj);

    if (tags) {
      tags.split(",").forEach(t => {
        const clean = t.trim();
        if (clean) tagSet.add(clean);
      });
    }
  });

  populateSelect("objectFilter", objectSet);
  populateSelect("tagFilter", tagSet);

  document.getElementById("objectFilter").addEventListener("change", applyFilters);
  document.getElementById("tagFilter").addEventListener("change", applyFilters);
}

/* ---------------------------
   POPULATE DROPDOWN (FIXED)
----------------------------*/
function populateSelect(id, values) {
  const select = document.getElementById(id);

  // reset first (prevents duplicates on reloads)
  select.innerHTML = `<option value="all">All</option>`;

  if (values.size === 0) {
    const option = document.createElement("option");
    option.textContent = "No options available";
    option.disabled = true;
    select.appendChild(option);
    return;
  }

  values.forEach(val => {
    const option = document.createElement("option");
    option.value = val;
    option.textContent = val;
    select.appendChild(option);
  });
}

/* ---------------------------
   FILTER LOGIC (FIXED)
----------------------------*/
function applyFilters() {
  const objectVal = document.getElementById("objectFilter").value;
  const tagVal = document.getElementById("tagFilter").value;

  const filtered = globalData.filter(item => {
    const obj = (item["What is the Object?"] || "").trim();
    const tags = (item["What tags best describe the item and its history?"] || "").toLowerCase();

    const objectMatch =
      objectVal === "all" ||
      obj.toLowerCase() === objectVal.toLowerCase();

    const tagMatch =
      tagVal === "all" ||
      tags.split(",").map(t => t.trim()).includes(tagVal.toLowerCase());

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
        <h3>${item["What is the Object?"] || "No Title"}</h3>
        <p>${item["Email Address"] || "N/A"}</p>
      </div>
    `;

    count++;
  });

  document.getElementById("listings").innerHTML =
    count ? html : "<p>No matching items</p>";
}