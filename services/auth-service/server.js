const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes");

const app = express();

app.use(bodyParser.json());

app.use(
  cors({
    origin: "http://127.0.0.1:5500",
    methods: ["POST"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use("/auth", authRoutes);

app.listen(3001, () => {
  console.log("✅ Auth Service running on port 3001");
});
