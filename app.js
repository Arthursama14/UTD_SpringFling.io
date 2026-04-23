const SHEET_ID = "1qevKj7o670qjJR5uRik30gknlQAvX87rrliKdpQ-5Xk";

// This pulls sheet data as JSON
const API_URL = `https://opensheet.elk.sh/${SHEET_ID}/Form%20Responses%201`;

fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    console.log("Data:", data);

    let html = "";
    let count = 0;

    data.forEach(item => {
      const approved = (item["Approved"] || "").toLowerCase();
      const availability = (item["Mark the current availability of the item. If the item is no longer available, please resubmit an updated form."] || "").toLowerCase();

      if (approved !== "yes" || availability !== "available") return;

      let image = item["Provide images of the item in question."];

      if (image && image.includes("id=")) {
        const id = image.split("id=")[1];
        image = `https://drive.google.com/uc?export=view&id=${id}`;
      }

      html += `
        <div class="card">
          <img src="${image || 'https://via.placeholder.com/300'}"/>
          <h3>${item["What is the Object?"]}</h3>
        </div>
      `;

      count++;
    });

    document.getElementById("listings").innerHTML =
      count === 0 ? "<p>No listings yet</p>" : html;
  })
  .catch(err => console.error(err));