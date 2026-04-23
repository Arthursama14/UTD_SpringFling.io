
const SHEET_ID = "1qevKj7o670qjJR5uRik30gknlQAvX87rrliKdpQ-5Xk";
const API_URL = `https://opensheet.elk.sh/${SHEET_ID}/Form%20Responses%201`;

let globalData = [];

/* =========================
   INIT
========================= */
fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    globalData = data;

    buildFilters(data);
    renderGrid(data);
  });

/* =========================
   FILTERS
========================= */
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

  document.getElementById("objectFilter").addEventListener("change", applyFilters);
  document.getElementById("tagFilter").addEventListener("change", applyFilters);
}

/* =========================
   POPULATE DROPDOWNS
========================= */
function populateSelect(id, values) {
  const select = document.getElementById(id);

  select.innerHTML = `<option value="all">All</option>`;

  if (!values || values.size === 0) {
    const opt = document.createElement("option");
    opt.textContent = "No options available";
    opt.disabled = true;
    select.appendChild(opt);
    return;
  }

  values.forEach(val => {
    const option = document.createElement("option");
    option.value = val;
    option.textContent = val;
    select.appendChild(option);
  });
}

/* =========================
   FILTER LOGIC
========================= */
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

/* =========================
   RENDER GRID
========================= */
function renderGrid(data) {
  let html = "";
  let count = 0;

  data.forEach((item, index) => {

    const listing = (item["Would you like to add an item for listing?"] || "")
      .toLowerCase()
      .includes("yes");

    const availability = (item["Mark the current availability of the item. If the item is no longer available, please resubmit an updated form."] || "")
      .toLowerCase()
      .includes("available");

    if (!listing || !availability) return;

    /* -------------------------
       MULTI IMAGE SUPPORT
    ------------------------- */
    let rawImage = (item["Provide images of the item in question."] || "").trim();

    let images = [];

    if (rawImage.includes(",")) {
      images = rawImage.split(",").map(i => i.trim());
    } else {
      images = [rawImage];
    }

    images = images.map(img => {
      if (img && img.includes("drive.google.com")) {
        const match = img.match(/[-\w]{25,}/);
        if (match) {
          return `https://lh3.googleusercontent.com/d/${match[0]}`;
        }
      }
      return img || "https://via.placeholder.com/300x200?text=No+Image";
    });

    /* -------------------------
       FIELDS
    ------------------------- */
    const objectName = item["What is the Object?"] || "No Item";
    const email = item["What is your contact info(UTD Email)"] || "N/A";
    const tags = item["What tags best describe the item and its history?"] || "None";
    const notes = item["Which option best explains your ideal exchange method? (Reminder. Items shouldn't be left unattended in public spaces and breezeways.)"] || "N/A";

    const willingHelp = (item["Are you comfortable with helping move this item if its heavy?"] || "")
      .toLowerCase()
      .trim();

    /* -------------------------
       CARD
    ------------------------- */
    html += `
      <div class="card">

        <img class="item-image"
             data-images='${JSON.stringify(images)}'
             src="${images[0]}"
             alt="Item Image" />

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

  startImageCycling();
}

/* =========================
   IMAGE CYCLING
========================= */
function startImageCycling() {
  document.querySelectorAll(".item-image").forEach(img => {

    const images = JSON.parse(img.dataset.images || "[]");
    if (images.length <= 1) return;

    let index = 0;

    setInterval(() => {
      index = (index + 1) % images.length;
      img.src = images[index];
    }, 3000);
  });
}

/* =========================
   LIGHTBOX (FULLSCREEN VIEW)
========================= */
document.addEventListener("click", (e) => {

  if (e.target.classList.contains("item-image")) {
    const lightbox = document.getElementById("lightbox");
    const img = document.getElementById("lightbox-img");

    img.src = e.target.src;
    lightbox.style.display = "flex";
  }

  if (e.target.id === "lightbox") {
    e.target.style.display = "none";
  }
});

/* =========================
   🌸 PETALS
========================= */
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

/* safe init */
window.addEventListener("load", () => {
  setInterval(createPetal, 300);
});