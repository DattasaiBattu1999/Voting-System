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

// ================= PUBLIC =================

// Get candidates (public)
router.get("/candidates", (req, res) => {
  db.query("SELECT * FROM candidates", (err, results) => {
    if (err) {
      return res.status(500).send("DB error");
    }
    res.json(results);
  });
});

// ================= ADMIN =================

// Get election results (ADMIN only)
router.get("/results", adminMiddleware, (req, res) => {
  db.query(`
    SELECT c.name AS candidate, COUNT(v.id) AS votes
    FROM candidates c
    LEFT JOIN votes v ON c.id = v.candidate_id
    GROUP BY c.id
  `, (err, results) => {
    if (err) {
      return res.status(500).send("DB error");
    }
    res.json(results);
  });
});

module.exports = router;
