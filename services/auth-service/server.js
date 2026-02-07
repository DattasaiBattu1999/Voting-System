const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes");

const app = express();

// Parse JSON body
app.use(bodyParser.json());

// ✅ Modern, safe CORS config (NO app.options("*"))
app.use(cors({
  origin: "http://127.0.0.1:5500",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Routes
app.use("/auth", authRoutes);

app.listen(3001, () => {
  console.log("Auth Service running on port 3001");
});
