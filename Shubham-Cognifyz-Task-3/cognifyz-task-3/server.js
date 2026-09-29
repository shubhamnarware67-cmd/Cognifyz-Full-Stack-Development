const express = require("express");
const path = require("node:path");

const app = express();
const port = process.env.PORT || 3003;
app.use(express.static(path.join(__dirname, "public")));
app.listen(port, () => console.log(`Shubham's studio page is running at http://localhost:${port}`));