// 🔗 Your Apps Script API
const API_URL = "https://script.google.com/macros/s/AKfycbxP0wiijf3Ee3dt-uG5G4MdhmntVoV9Utd-exkFG-NxZsfvQPPZ2qkIuIOA86qPAVpn/exec";

fetch(API_URL)
  .then(response => response.json())
  .then(data => {
    console.log("API Data:", data); // 🧪 Debug

    // 🛑 Ensure data is an array
    if (!Array.isArray(data)) {
      console.error("❌ Data is not an array:", data);
      document.getElementById("listings").innerHTML = "<p>Data error. Check console.</p>";
      return;
    }

    let html = "";
    let count = 0; // track how many items render

    data.forEach(item => {
      console.log("Row:", item); // 🔍 inspect each row

      // ✅ FILTER: Approved + Available (case-insensitive safety)
      const approved = (item["Approved"] || "").toLowerCase();
      const availability = (item["Mark the current availability of the item. If the item is no longer available, please resubmit an updated form."] || "").toLowerCase();

      if (approved !== "yes" || availability !== "available") {
        return;
      }

      // 🖼️ HANDLE IMAGE
      let image = item["Provide images of the item in question."];

      if (image) {
        // multiple images → take first
        if (image.includes(",")) {
          image = image.split(",")[0];
        }

        // convert Google Drive link
        if (image.includes("id=")) {
          const fileId = image.split("id=")[1];
          image = `https://drive.google.com/uc?export=view&id=${fileId}`;
        }
      } else {
        image = "https://via.placeholder.com/300x200?text=No+Image";
      }

      // 🧱 BUILD CARD
      html += `
        <div class="card">
          <img src="${image}" alt="Item Image"/>

          <h3>${item["What is the Object?"] || "No Title"}</h3>

          <p><strong>Contact:</strong> ${item["Email Address"] || "N/A"}</p>

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

    // 📦 Render results
    if (count === 0) {
      document.getElementById("listings").innerHTML = "<p style='text-align:center;'>No approved listings available.</p>";
    } else {
      document.getElementById("listings").innerHTML = html;
    }

    console.log(`✅ Rendered ${count} items`);
  })
  .catch(error => {
    console.error("❌ Fetch error:", error);
    document.getElementById("listings").innerHTML = "<p style='text-align:center;'>Failed to load data.</p>";
  });