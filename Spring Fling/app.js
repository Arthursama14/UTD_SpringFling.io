const API_URL = "https://script.google.com/macros/s/AKfycbxP0wiijf3Ee3dt-uG5G4MdhmntVoV9Utd-exkFG-NxZsfvQPPZ2qkIuIOA86qPAVpn/exec";

// ✅ Add proxy in front
const PROXY = "https://api.allorigins.win/raw?url=";

fetch(PROXY + encodeURIComponent(API_URL))
  .then(response => response.json())
  .then(data => {
    console.log("API Data:", data);

    let html = "";

    data.forEach(item => {
      html += `<div class="card">
        <h3>${item["What is the Object?"]}</h3>
      </div>`;
    });

    document.getElementById("listings").innerHTML = html;
  })
  .catch(error => {
    console.error("Fetch error:", error);
  });