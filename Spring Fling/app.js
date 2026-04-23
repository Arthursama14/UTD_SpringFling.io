const SHEET_ID = "1qevKj7o670qjJR5uRik30gknlQAvX87rrliKdpQ-5Xk";
const API_URL = `https://opensheet.elk.sh/${SHEET_ID}/Form%20Responses%201`;

let renderedItems = new Set(); // track duplicates

function fetchDataAndRender() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {

      let html = "";

      data.forEach(item => {

        const id = item.Timestamp + item["Email Address"]; 
        if (renderedItems.has(id)) return; // skip duplicates

        const listing = (item["Would you like to add an item for listing?"] || "").toLowerCase();
        const availability = (item["Mark the current availability of the item. If the item is no longer available, please resubmit an updated form."] || "").toLowerCase();

        if (listing !== "yes" || availability !== "available") return;

        let image = item["Provide images of the item in question."] || "";

        if (image.includes("drive.google.com") || image.match(/[-\w]{25,}/)) {
          const match = image.match(/[-\w]{25,}/);
          if (match) {
            image = `https://lh3.googleusercontent.com/d/${match[0]}`;
          }
        }

        html += `
          <div class="card">
            <img src="${image || 'https://via.placeholder.com/300'}"/>
            <h3>${item["What is the Object?"]}</h3>
          </div>
        `;

        renderedItems.add(id);
      });

      document.getElementById("listings").innerHTML = html;
    })
    .catch(err => console.error(err));
}

// initial load
fetchDataAndRender();

// 🔄 auto-refresh every 10 seconds
setInterval(fetchDataAndRender, 10000);