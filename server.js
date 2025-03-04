const express = require("express");
const path = require("path");
const app = express();

// Serve static files from the current directory
app.use(express.static(__dirname));

// Start server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log("Press Ctrl+C to quit.");
});
