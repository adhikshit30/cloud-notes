import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
{
ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
title: { type: String, default: "Untitled" },
content: { type: String, default: "" }
},
{ timestamps: true }
);

export default mongoose.model("Note", noteSchema);