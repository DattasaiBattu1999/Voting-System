// LOGIN FUNCTION
function login() {
  const nationalId = document.getElementById("nid").value;
  const password = document.getElementById("pwd").value;

  fetch("http://localhost:3001/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      national_id: nationalId,
      password: password
    })
  })
    .then(res => {
      if (!res.ok) throw new Error("Login failed");
      return res.json();
    })
    .then(data => {
      localStorage.setItem("token", data.token);
      window.location.href = "vote.html";
    })
    .catch(err => {
      alert("Login failed");
      console.error(err);
    });
}

fetch("http://localhost:3003/election/candidates")
  .then(res => res.json())
  .then(data => {
    const div = document.getElementById("candidates");
    if (!div) return;

    // CLEAR old buttons
    div.innerHTML = "";

    data.forEach(c => {
      const btn = document.createElement("button");
      btn.innerText = c.name;
      btn.className = `vote-btn ${c.name.toLowerCase()}`;
      btn.onclick = () => vote(c.id);
      div.appendChild(btn);
    });
  })
  .catch(err => console.error("Failed to load candidates", err));


// VOTE
function vote(candidateId) {
  fetch("http://localhost:3002/voter/vote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: 1,          // demo
      candidate_id: candidateId
    })
  })
    .then(res => res.text())
    .then(msg => alert(msg))
    .catch(err => console.error("Vote failed", err));
}

// LOGOUT
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}
