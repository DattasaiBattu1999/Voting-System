(function checkAuth() {
  const token = localStorage.getItem("token");
  if (!token && window.location.pathname.includes("vote.html")) {
    window.location.href = "index.html";
  }
})();

// ================= LOGIN =================
function login(event) {
  if (event) event.preventDefault(); // 🔑 stop form submit

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
      if (!res.ok) {
        throw new Error("Invalid credentials");
      }
      return res.json();
    })
    .then(data => {
      // ✅ redirect ONLY on success
      localStorage.setItem("token", data.token);

      if (data.role === "ADMIN") {
        window.location.href = "/frontend/admin.html";
      } else {
        window.location.href = "/frontend/vote.html";
      }
    })
    .catch(err => {
      alert("Invalid credentials");
      console.error(err);
      return; // 🔑 stop execution
    });
}


// ================= LOAD CANDIDATES =================
function loadCandidates() {
  fetch("http://localhost:3003/election/candidates")
    .then(res => res.json())
    .then(data => {
      const div = document.getElementById("candidates");
      if (!div) return;

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
}

// Automatically load candidates on vote.html
loadCandidates();

// ================= VOTE =================
function vote(candidateId) {
  disableVoteButtons();

  const token = localStorage.getItem("token");

  if (!token) {
    handleSessionExpired();
    return;
  }

  fetch("http://localhost:3002/voter/vote", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ candidate_id: candidateId })
  })
    .then(async res => {
      if (res.status === 401) {
        handleSessionExpired();
        throw new Error("Session expired");
      }

      if (!res.ok) {
        throw new Error("Vote already cast");
      }

      return res.text();
    })
    .then(() => {
      showMessage("✅ Vote submitted successfully", "success");
    })
    .catch(err => {
      if (err.message !== "Session expired") {
        showMessage("❌ You have already voted", "error");
        disableVoteButtons();
      }
    });
}



// ================= HELPERS =================
function disableVoteButtons() {
  document.querySelectorAll(".vote-btn").forEach(btn => {
    btn.disabled = true;
    btn.style.opacity = "0.6";
    btn.style.cursor = "not-allowed";
  });
}

function showMessage(text, type) {
  let msg = document.getElementById("message");

  if (!msg) {
    msg = document.createElement("div");
    msg.id = "message";
    document.querySelector(".container").appendChild(msg);
  }

  msg.innerText = text;
  msg.className = `message ${type}`;
}

//================== SESSION EXPIRED HANDLER =================
function handleSessionExpired() {
  localStorage.removeItem("token");
  alert("Your session has expired. Please login again.");
  window.location.href = "index.html";
}


// ================= LOGOUT =================
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}
