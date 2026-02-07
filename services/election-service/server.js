const express = require("express");
const cors = require("cors");
const electionRoutes = require("./routes");

const app = express();

// Enable CORS
app.use(cors());

// Routes
app.use("/election", electionRoutes);

app.listen(3003, () => {
  console.log("Election Service running on port 3003");
});
