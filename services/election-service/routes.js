const express = require("express");
const mysql = require("mysql2");
const adminMiddleware = require("./adminMiddleware");

const router = express.Router();

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "voting_system"
});

/* ================= PUBLIC ================= */

// Get candidates
router.get("/candidates", (req, res) => {
  db.query(
    "SELECT id, name, party FROM candidates WHERE is_active = true",
    (err, results) => {
      if (err) return res.status(500).send("DB error");
      res.json(results);
    }
  );
});


// Get election status
router.get("/status", (req, res) => {
  db.query(
    "SELECT status FROM election_status WHERE id = 1",
    (err, result) => {
      if (err || result.length === 0) {
        return res.status(500).send("Status not found");
      }
      res.json({ status: result[0].status });
    }
  );
});

/* ================= ADMIN ================= */

// Open / Close election
router.post("/status", adminMiddleware, (req, res) => {
  const { status } = req.body;

  if (!["OPEN", "CLOSED"].includes(status)) {
    return res.status(400).send("Invalid status");
  }

  db.query(
    "UPDATE election_status SET status=?, updated_at=NOW() WHERE id=1",
    [status],
    err => {
      if (err) return res.status(500).send("DB error");
      res.send(`Election is now ${status}`);
    }
  );
});


// Add candidate
router.post("/candidate", adminMiddleware, (req, res) => {
  const { name, party } = req.body;

  if (!name || !party) {
    return res.status(400).send("Candidate name and party required");
  }

  db.query(
    "SELECT status FROM election_status WHERE id = 1",
    (err, result) => {
      if (err || result.length === 0)
        return res.status(500).send("Election status error");

      if (result[0].status === "OPEN") {
        return res.status(403).send("Election already started");
      }

      db.query(
        "INSERT INTO candidates (name, party) VALUES (?, ?)",
        [name, party],
        err => {
          if (err) return res.status(500).send("DB error");
          res.send("Candidate added");
        }
      );
    }
  );
});


// 🔥 DELETE CANDIDATE (FIXED)
router.delete("/candidate/:id", adminMiddleware, (req, res) => {
  const candidateId = Number(req.params.id);
  console.log("🔥 DELETE CANDIDATE ID:", candidateId);

  if (!candidateId) {
    return res.status(400).send("Invalid candidate id");
  }

  db.query(
    "SELECT status FROM election_status WHERE id = 1",
    (err, result) => {
      if (err || result.length === 0)
        return res.status(500).send("Election status error");

      if (result[0].status === "OPEN") {
        return res.status(403).send("Election already started");
      }

      db.query(
        "UPDATE candidates SET is_active = false WHERE id = ?",
        [candidateId],
        err => {
          if (err) return res.status(500).send("DB error");
          res.send("Candidate removed");
        }
      );
    }
  );
});

// Get results
router.get("/results", adminMiddleware, (req, res) => {
  db.query(
    `
    SELECT 
      c.name AS candidate,
      c.party AS party,
      COUNT(v.id) AS votes
    FROM candidates c
    LEFT JOIN votes v ON c.id = v.candidate_id
    WHERE c.is_active = true
    GROUP BY c.id
    `,
    (err, results) => {
      if (err) return res.status(500).send("DB error");
      res.json(results);
    }
  );
});

module.exports = router;
