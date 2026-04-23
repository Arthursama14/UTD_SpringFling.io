const SHEET_ID = "1qevKj7o670qjJR5uRik30gknlQAvX87rrliKdpQ-5Xk";
const API_URL = `https://opensheet.elk.sh/${SHEET_ID}/Form%20Responses%201`;

fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    console.log("Raw Data:", data);

    let html = "";
    let count = 0;

    data.forEach(item => {

      // 🔍 SAFER FIELD ACCESS (prevents silent failures)
      const listing = (item["Would you like to add an item for listing?"] || "").trim().toLowerCase();
      const availability = (item["Mark the current availability of the item. If the item is no longer available, please resubmit an updated form."] || "").trim().toLowerCase();

      console.log("Row check:", { listing, availability });

      // 🛑 FILTER (only show valid listings)
      if (listing !== "yes" || availability !== "available") {
        return;
      }

      // 🖼️ IMAGE HANDLING (safe fallback)
      let image = item["Provide images of the item in question."] || "";

      // Handle Google Drive links
      if (image.includes("id=")) {
        const id = image.split("id=")[1];
        image = `https://drive.google.com/uc?export=view&id=${id}`;
      }

      if (!image) {
        image = "https://via.placeholder.com/300x200?text=No+Image";
      }

      // 🧱 CARD BUILD
      html += `
        <div class="card">
          <img src="${image}" alt="Item Image" />

          <h3>${item["What is the Object?"] || "No Title"}</h3>

          <p><strong>Email:</strong> ${item["Email Address"] || "N/A"}</p>

          <p class="tags">
            <strong>Tags:</strong> ${item["What tags best describe the item and its history?"] || "None"}
          </p>

          <p>
            <strong>Exchange:</strong> ${item["Which option best explains your ideal exchange method? (Reminder. Items shouldn't be left unattended in public spaces and breezeways.)"] || "N/A"}
          </p>
        </div>
      `;

      count++;
    });

    // 📦 Render result
    document.getElementById("listings").innerHTML =
      count > 0
        ? html
        : "<p style='text-align:center;'>No approved listings found.</p>";

    console.log("Rendered items:", count);
  })
  .catch(err => {
    console.error("Fetch error:", err);
    document.getElementById("listings").innerHTML =
      "<p style='text-align:center;'>Failed to load listings.</p>";
  });