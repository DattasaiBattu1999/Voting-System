(function checkAdminAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Unauthorized");
    window.location.href = "index.html";
  }
})();

fetch("http://localhost:3003/election/results", {
  headers: {
    "Authorization": `Bearer ${localStorage.getItem("token")}`
  }
})
  .then(res => {
    if (res.status === 403) {
      alert("Access denied. Admin only.");
      window.location.href = "index.html";
      return;
    }
    return res.json();
  })
  .then(data => {
    const tbody = document.querySelector("#resultsTable tbody");
    tbody.innerHTML = "";

    data.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.candidate}</td>
        <td>${row.votes}</td>
      `;
      tbody.appendChild(tr);
    });
  })
  .catch(err => console.error("Failed to load results", err));

function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}
