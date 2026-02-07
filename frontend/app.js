/*************************************************
 * ROUTE PROTECTION (UX LEVEL)
 *************************************************/
(function checkAuth() {
  const token = localStorage.getItem("token");
  const path = window.location.pathname;

  // Protect voter page
  if (path.includes("vote.html") && !token) {
    window.location.href = "index.html";
  }

  // Protect admin page
  if (path.includes("admin.html") && !token) {
    window.location.href = "admin-login.html";
  }
})();

/*************************************************
 * VOTER LOGIN
 *************************************************/
function login(event) {
  if (event) event.preventDefault();

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
      if (!res.ok) throw new Error("Invalid credentials");
      return res.json();
    })
    .then(data => {
      if (data.role !== "VOTER") {
        alert("Please use Admin Login");
        return;
      }

      localStorage.setItem("token", data.token);
      window.location.href = "vote.html";
    })
    .catch(err => {
      alert("Invalid credentials");
      console.error(err);
    });
}

/*************************************************
 * ADMIN LOGIN (SEPARATE PAGE)
 *************************************************/
function adminLogin(event) {
  if (event) event.preventDefault();

  const nationalId = document.getElementById("adminId").value;
  const password = document.getElementById("adminPwd").value;

  fetch("http://localhost:3001/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      national_id: nationalId,
      password: password
    })
  })
    .then(res => {
      if (!res.ok) throw new Error("Invalid credentials");
      return res.json();
    })
    .then(data => {
      if (data.role !== "ADMIN") {
        alert("Access denied. Admins only.");
        return;
      }

      localStorage.setItem("token", data.token);
      window.location.href = "admin.html";
    })
    .catch(err => {
      alert("Invalid admin credentials");
      console.error(err);
    });
}

/*************************************************
 * LOAD CANDIDATES (VOTER PAGE ONLY)
 *************************************************/
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

if (window.location.pathname.includes("vote.html")) {
  loadCandidates();
}

/*************************************************
 * VOTE (JWT PROTECTED)
 *************************************************/
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
    .then(res => {
      if (res.status === 401) {
        handleSessionExpired();
        throw new Error("Session expired");
      }
      if (!res.ok) throw new Error("Already voted");
      return res.text();
    })
    .then(() => {
      showMessage("✅ Vote submitted successfully", "success");
    })
    .catch(err => {
      if (err.message !== "Session expired") {
        showMessage("❌ You have already voted", "error");
      }
    });
}

/*************************************************
 * UI HELPERS
 *************************************************/
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

/*************************************************
 * SESSION EXPIRY HANDLER
 *************************************************/
function handleSessionExpired() {
  localStorage.removeItem("token");

  if (window.location.pathname.includes("admin")) {
    alert("Admin session expired. Please login again.");
    window.location.href = "admin-login.html";
  } else {
    alert("Session expired. Please login again.");
    window.location.href = "index.html";
  }
}

/*************************************************
 * LOGOUT
 *************************************************/
function logout() {
  localStorage.removeItem("token");

  if (window.location.pathname.includes("admin")) {
    window.location.href = "admin-login.html";
  } else {
    window.location.href = "index.html";
  }
}
