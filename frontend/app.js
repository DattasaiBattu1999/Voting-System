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
    body: JSON.stringify({ national_id: nationalId, password })
  })
    .then(res => {
      if (!res.ok) throw new Error();
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
    .catch(() => alert("Invalid credentials"));
}

/*************************************************
 * ADMIN LOGIN
 *************************************************/
function adminLogin(event) {
  if (event) event.preventDefault();

  const nationalId = document.getElementById("adminId").value;
  const password = document.getElementById("adminPwd").value;

  fetch("http://localhost:3001/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ national_id: nationalId, password })
  })
    .then(res => {
      if (!res.ok) throw new Error();
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
    .catch(() => alert("Invalid admin credentials"));
}

/*************************************************
 * LOAD CANDIDATES
 *************************************************/
/*************************************************
 * LOAD CANDIDATES (VOTER PAGE)
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
        btn.className = "vote-btn";

        // ✅ THIS IS WHERE PARTY NAME GOES
        btn.innerText = `${c.name} (${c.party})`;

        btn.onclick = () => vote(c.id);
        div.appendChild(btn);
      });
    })
    .catch(() => {
      console.error("Failed to load candidates");
    });
}


/*************************************************
 * CHECK IF USER ALREADY VOTED
 *************************************************/
function checkVoteStatus() {
  const token = localStorage.getItem("token");
  if (!token) return;

  fetch("http://localhost:3002/voter/status", {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      if (data.hasVoted) {
        disableVoteButtons();
        showMessage("✅ You have already voted. Thank you.", "success");
      }
    })
    .catch(() => console.error("Vote status check failed"));
}

/*************************************************
 * CAST VOTE
 *************************************************/
function vote(candidateId) {
  const token = localStorage.getItem("token");
  if (!token) {
    handleSessionExpired();
    return;
  }

  disableVoteButtons();

  fetch("http://localhost:3002/voter/vote", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ candidate_id: candidateId })
  })
    .then(res => {
      if (res.status === 401) {
        handleSessionExpired();
        throw new Error("Session expired");
      }
      if (res.status === 403) {
        throw new Error("Election closed");
      }
      if (!res.ok) {
        throw new Error("Already voted");
      }
      return res.text();
    })
    .then(() => showMessage("✅ Vote submitted successfully", "success"))
    .catch(err => {
      if (err.message === "Election closed") {
        showMessage("🚫 Election is CLOSED", "error");
      } else if (err.message !== "Session expired") {
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
 * SESSION EXPIRY
 *************************************************/
function handleSessionExpired() {
  localStorage.removeItem("token");
  alert("Session expired. Please login again.");

  if (window.location.pathname.includes("admin")) {
    window.location.href = "admin-login.html";
  } else {
    window.location.href = "home.html";
  }
}

/*************************************************
 * LOGOUT
 *************************************************/
function logout() {
  localStorage.removeItem("token");
  window.location.href = window.location.pathname.includes("admin")
    ? "admin-login.html"
    : "home.html";
}

/*************************************************
 * PAGE INIT (CORRECT & CLEAN)
 *************************************************/
if (window.location.pathname.includes("vote.html")) {
  initializeVotePage();
}

function initializeVotePage() {
  fetch("http://localhost:3003/election/status")
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("candidates");

      if (data.status !== "OPEN") {
        container.innerHTML = `
          <p style="color:red; font-weight:bold;">
            🚫 Election is currently CLOSED
          </p>
        `;
        return;
      }

      // Election is OPEN
      loadCandidates();
      checkVoteStatus();
    })
    .catch(() => console.error("Failed to initialize vote page"));
}
