// 🔗 REPLACE THIS WITH YOUR APPS SCRIPT URL
const API_URL = "https://script.google.com/macros/s/AKfycbxP0wiijf3Ee3dt-uG5G4MdhmntVoV9Utd-exkFG-NxZsfvQPPZ2qkIuIOA86qPAVpn/exec";

fetch(API_URL)
  .then(response => response.json())
  .then(data => {
    console.log("API Data:", data); // 🧪 Debug

    // 🛑 If data is not an array, stop early
    if (!Array.isArray(data)) {
      console.error("Data is not an array:", data);
      return;
    }

    let html = "";

    data.forEach(item => {

      // ✅ FILTER: Only approved + available items
      const approved = item["Approved"];
      const availability = item["Mark the current availability of the item. If the item is no longer available, please resubmit an updated form."];

      if (approved !== "Yes" || availability !== "Available") {
        return; // skip this item
      }

      // 🖼️ HANDLE IMAGE
      let image = item["Provide images of the item in question."];

      if (image) {
        // If multiple images, take the first
        if (image.includes(",")) {
          image = image.split(",")[0];
        }

        // Convert Google Drive link → usable image link
        if (image.includes("id=")) {
          const fileId = image.split("id=")[1];
          image = `https://drive.google.com/uc?export=view&id=${fileId}`;
        }
      } else {
        // fallback image
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
    });

    // 📦 Render to page
    document.getElementById("listings").innerHTML = html;
  })
  .catch(error => {
    console.error("Fetch error:", error);
  });