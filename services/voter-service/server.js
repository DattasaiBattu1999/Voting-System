const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const voterRoutes = require("./routes");

const app = express();

// Parse JSON
app.use(bodyParser.json());

// ✅ Enable CORS (modern, safe)
app.use(cors({
  origin: "http://127.0.0.1:5500",
  methods: ["POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Routes
app.use("/voter", voterRoutes);

app.listen(3002, () => {
  console.log("Voter Service running on port 3002");
});
