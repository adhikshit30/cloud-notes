import mongoose from "mongoose";

const shareSchema = new mongoose.Schema(
{
noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note", index: true },
fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
toUserEmail: { type: String, lowercase: true },
linkToken: { type: String, index: true },
canEdit: { type: Boolean, default: false }
},
{ timestamps: true }
);

export default mongoose.model("Share", shareSchema);