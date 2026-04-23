const SHEET_ID = "1qevKj7o670qjJR5uRik30gknlQAvX87rrliKdpQ-5Xk";
const API_URL = `https://opensheet.elk.sh/${SHEET_ID}/Form%20Responses%201`;

let lastHTML = "";

function fetchDataAndRender() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      console.log("Raw Data:", data);

      let html = "";
      let count = 0;

      data.forEach(item => {

        // 🧠 SAFE NORMALIZATION
        const listingText = (item["Would you like to add an item for listing?"] || "")
          .toLowerCase()
          .trim();

        const availabilityText = (item["Mark the current availability of the item. If the item is no longer available, please resubmit an updated form."] || "")
          .toLowerCase()
          .trim();

        // 🔥 FLEXIBLE FILTER (FIXED)
        const listing = listingText.includes("yes");
        const availability = availabilityText.includes("available");

        if (!listing || !availability) return;

        // 🖼️ IMAGE HANDLING
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

        // 🧱 BUILD CARD
        html += `
          <div class="card">
            <img src="${image}" alt="Item Image" />

            <h3>${item["What is the Object?"] || "No Title"}</h3>

            <p><strong>Email:</strong> ${item["Email Address"] || "N/A"}</p>

            <p class="tags">
              <strong>Tags:</strong> ${item["What tags best describe the item and its history?"] || "None"}
            </p>

            <p>
              <strong>Exchange:</strong> ${
                item["Which option best explains your ideal exchange method? (Reminder. Items shouldn't be left unattended in public spaces and breezeways.)"] || "N/A"
              }
            </p>
          </div>
        `;

        count++;
      });

      // 📦 RENDER (stable version)
      const container = document.getElementById("listings");

      if (html !== lastHTML) {
        container.innerHTML =
          count > 0
            ? html
            : "<p style='text-align:center;'>No approved listings found.</p>";

        lastHTML = html;
      }

      console.log("Rendered items:", count);
    })
    .catch(err => {
      console.error("Fetch error:", err);
      document.getElementById("listings").innerHTML =
        "<p style='text-align:center;'>Failed to load listings.</p>";
    });
}

// 🚀 INITIAL LOAD
fetchDataAndRender();

// 🔄 OPTIONAL AUTO-REFRESH (safe + non-destructive)
setInterval(fetchDataAndRender, 15000);