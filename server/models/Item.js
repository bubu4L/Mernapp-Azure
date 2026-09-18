// A minimal resource ("Item") so the app has something real to store
// and fetch from MongoDB - swap this out for your own models.
const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);
