import mongoose from "mongoose";

const linkSchema = new mongoose.Schema({
  slug: String,
  originalUrl: String,
});

export default mongoose.models.Link || mongoose.model("Link", linkSchema);
