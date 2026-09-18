// server/server.js
require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const itemsRouter = require("./routes/items");

const app = express();

// IMPORTANT for Azure: App Service sets its own PORT environment
// variable and expects your app to listen on it - you don't pick
// the port yourself in production. process.env.PORT falls back to
// 5000 for local development, where nothing sets that variable.
const PORT = process.env.PORT || 5000;

app.use(express.json());

// ---- Connect to MongoDB (Atlas, since Azure has no MongoDB of its own) ----
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ---- API routes ----
app.use("/api/items", itemsRouter);

// ---- Serve the built React frontend ----
// After running `npm run build` inside /client, copy the resulting
// build/ folder's CONTENTS into server/public (see the checkpoint's
// own instructions, and the README here). Express then serves that
// as static files, and any route that isn't an /api/... call falls
// back to index.html - which is what lets client-side routing (if
// you add React Router later) work correctly on page refresh.
app.use(express.static(path.join(__dirname, "public")));

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
