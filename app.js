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

    const tagsRaw = (item["What tags best describe the item and its history?"] || "")
      .toLowerCase()
      .trim();

    if (obj) objectSet.add(obj);

    if (tagsRaw) {
      tagsRaw
        .split(/[,;|]/)
        .map(t => t.trim().toLowerCase())
        .filter(Boolean)
        .forEach(t => tagSet.add(t));
    }
  });

  populateSelect("objectFilter", objectSet);
  populateSelect("tagFilter", tagSet);

  document.getElementById("objectFilter")
    .addEventListener("change", applyFilters);

  document.getElementById("tagFilter")
    .addEventListener("change", applyFilters);
}

/* ---------------------------
   POPULATE DROPDOWN
----------------------------*/
function populateSelect(id, values) {
  const select = document.getElementById(id);

  select.innerHTML = `<option value="all">All</option>`;

  if (!values || values.size === 0) {
    const option = document.createElement("option");
    option.textContent = "No options available";
    option.disabled = true;
    select.appendChild(option);
    return;
  }

  values.forEach(val => {
    const option = document.createElement("option");
    option.value = val.toLowerCase();
    option.textContent = val;
    select.appendChild(option);
  });
}

/* ---------------------------
   FILTER LOGIC
----------------------------*/
function applyFilters() {
  const objectVal = document.getElementById("objectFilter").value;
  const tagVal = document.getElementById("tagFilter").value;

  const filtered = globalData.filter(item => {

    const obj = (item["What is the Object?"] || "").trim().toLowerCase();

    const tags = (item["What tags best describe the item and its history?"] || "")
      .toLowerCase();

    const tagList = tags.split(/[,;|]/).map(t => t.trim());

    const objectMatch =
      objectVal === "all" ||
      obj === objectVal;

    const tagMatch =
      tagVal === "all" ||
      tagList.includes(tagVal);

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

    /* ---------------------------
       IMAGE HANDLING (SAFE)
    ----------------------------*/
    let image = (item["Provide images of the item in question."] || "").trim();

    if (image && image.includes("drive.google.com")) {
      const match = image.match(/[-\w]{25,}/);
      if (match) {
        image = `https://lh3.googleusercontent.com/d/${match[0]}`;
      }
    }

    if (!image) {
      image = "https://via.placeholder.com/300x200?text=No+Image";
    }

    /* ---------------------------
       FIELDS
    ----------------------------*/
    const objectName = item["What is the Object?"] || "No Item";
    const email = item["What is your contact info(UTD Email)"] || "N/A";
    const tags = item["What tags best describe the item and its history?"] || "None";
    const notes = item["Which option best explains your ideal exchange method? (Reminder. Items shouldn't be left unattended in public spaces and breezeways.)"] || "N/A";

    const willingHelp = (item["Are you comfortable with helping move this item if its heavy?"] || "")
      .toLowerCase()
      .trim();

    /* ---------------------------
       CARD HTML
    ----------------------------*/
    html += `
      <div class="card">

        <img src="${image}" alt="Item Image" />

        <h3>${objectName}</h3>

        <p><strong>Email:</strong> ${email}</p>

        <p class="tags"><strong>Tags:</strong> ${tags}</p>

        <p><strong>Notes:</strong> ${notes}</p>

        ${willingHelp === "yes"
          ? `<p style="color:green;"><strong>*Willing to help move</strong></p>`
          : ""
        }

      </div>
    `;

    count++;
  });

  document.getElementById("listings").innerHTML =
    count ? html : "<p>No matching items</p>";
}

/* ---------------------------
   🌸 PETALS (FIXED INIT)
----------------------------*/
function createPetal() {
  const petal = document.createElement("div");
  petal.classList.add("petal");

  petal.style.left = Math.random() * window.innerWidth + "px";

  const size = Math.random() * 8 + 18;
  petal.style.width = size + "px";
  petal.style.height = size + "px";

  const duration = Math.random() * 5 + 5;
  petal.style.animationDuration = duration + "s";

  document.body.appendChild(petal);

  setTimeout(() => petal.remove(), duration * 1000);
}

/* IMPORTANT: wait for page load */
window.addEventListener("load", () => {
  setInterval(createPetal, 300);
});