/*************************************************
 * LOAD CANDIDATES
 *************************************************/
function loadCandidates() {
  fetch("http://localhost:3003/election/candidates")
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("candidateList");
      list.innerHTML = "";

      data.forEach(c => {
        const li = document.createElement("li");
        li.innerHTML = `
          <span><b>${c.name}</b> (${c.party})</span>
          <button onclick="deleteCandidate(${c.id})">❌</button>
        `;
        list.appendChild(li);
      });
    });
}


/*************************************************
 * ADD CANDIDATE
 *************************************************/
function addCandidate() {
  const name = document.getElementById("candidateName").value.trim();
  const party = document.getElementById("partyName").value.trim();
  const token = localStorage.getItem("token");

  if (!name || !party) {
    alert("Enter candidate name and party");
    return;
  }

  fetch("http://localhost:3003/election/candidate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name, party })
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to add candidate");
      return res.text();
    })
    .then(() => {
      document.getElementById("candidateName").value = "";
      document.getElementById("partyName").value = "";
      loadCandidates();
      loadResults();
    })
    .catch(err => alert(err.message));
}


/*************************************************
 * DELETE CANDIDATE (FIXED)
 *************************************************/
function deleteCandidate(id) {
  console.log("🗑️ Deleting candidate:", id);
  const token = localStorage.getItem("token");

  fetch(`http://localhost:3003/election/candidate/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => {
      if (res.status === 403) throw new Error("Election already started");
      if (!res.ok) throw new Error("Failed to delete candidate");
      return res.text();
    })
    .then(() => loadCandidates())
    .catch(err => alert(err.message));
}

/*************************************************
 * LOAD RESULTS
 *************************************************/
function loadResults() {
  const token = localStorage.getItem("token");

  fetch("http://localhost:3003/election/results", {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      const body = document.getElementById("resultsBody");
      body.innerHTML = "";

      data.forEach(r => {
        body.innerHTML += `
          <tr>
            <td>${r.candidate} (${r.party})</td>
            <td>${r.votes}</td>
          </tr>
        `;
      });
    });
}


/*************************************************
 * INIT
 *************************************************/
loadCandidates();
loadResults();
